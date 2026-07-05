"""
Authentication Service — OTP Flow
Step 1: request_otp  → creates user if new, generates 6-digit code, emails it
Step 2: verify_otp   → validates code, returns JWT tokens
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.email import send_otp_email
from app.core.security import create_access_token, create_refresh_token, decode_token, generate_otp, generate_secure_token
from app.models.user import User
from app.schemas.user import OTPRequest

OTP_EXPIRE_MINUTES = 10
OTP_MAX_ATTEMPTS   = 5


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower()).first()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


async def request_otp(db: Session, body: OTPRequest) -> dict:
    """
    Send a 6-digit OTP to the user's email.
    - If the email is new AND first_name/last_name were provided → create the account first.
    - If the email is new AND no name provided → ask for the name.
    - If the email already exists → just send a new OTP.
    """
    email = body.email.lower().strip()
    user  = get_user_by_email(db, email)
    is_new = user is None

    if is_new:
        if not body.first_name or not body.last_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="new_user",   # frontend uses this to show name fields
            )
        user = User(
            email=body.email.lower(),
            first_name=body.first_name.strip(),
            last_name=body.last_name.strip(),
        )
        db.add(user)
        db.flush()

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support.",
        )

    otp = generate_otp()
    user.otp_code       = otp
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)
    user.otp_attempts   = 0
    db.commit()

    await send_otp_email(email, user.full_name(), otp, is_new)
    return {"message": f"A 6-digit code has been sent to {email}.", "is_new_user": is_new}


def verify_otp(db: Session, email: str, otp_code: str) -> dict:
    """
    Validate the OTP code and return JWT tokens if correct.
    Tracks failed attempts and locks out after OTP_MAX_ATTEMPTS.
    """
    user = get_user_by_email(db, email.lower())

    if not user or not user.otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP was requested for this email. Please request a new code.",
        )

    if user.otp_attempts >= OTP_MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many incorrect attempts. Please request a new code.",
        )

    if user.otp_expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This code has expired. Please request a new one.",
        )

    if user.otp_code != otp_code.strip():
        user.otp_attempts += 1
        db.commit()
        remaining = OTP_MAX_ATTEMPTS - user.otp_attempts
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Incorrect code. {remaining} attempt{'s' if remaining != 1 else ''} remaining.",
        )

    # Success — clear OTP and mark email verified
    user.otp_code         = None
    user.otp_expires_at   = None
    user.otp_attempts     = 0
    user.is_email_verified = True
    user.last_login_at    = datetime.now(timezone.utc)
    db.commit()

    return {
        "access_token":  create_access_token(str(user.id)),
        "refresh_token": create_refresh_token(str(user.id)),
        "token_type":    "bearer",
    }


def refresh_access_token(db: Session, refresh_token: str) -> dict:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token.")

    user = get_user_by_id(db, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")

    return {
        "access_token":  create_access_token(str(user.id)),
        "refresh_token": create_refresh_token(str(user.id)),
        "token_type":    "bearer",
    }
