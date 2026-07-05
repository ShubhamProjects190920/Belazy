"""
Authentication Endpoints — OTP Flow
POST /auth/request-otp   → send 6-digit code to email
POST /auth/verify-otp    → validate code, return JWT tokens
POST /auth/refresh       → exchange refresh token for new access token
GET  /auth/me            → get current user profile
PUT  /auth/me            → update name
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.token import RefreshTokenRequest, Token
from app.schemas.user import MessageResponse, OTPRequest, OTPVerify, UserResponse, UserUpdate
from app.services import auth as auth_service

router = APIRouter()


@router.post(
    "/request-otp",
    response_model=dict,
    summary="Step 1 — Send a 6-digit OTP to the user's email",
)
async def request_otp(body: OTPRequest, db: Session = Depends(get_db)):
    """
    Works for both Sign Up and Sign In:
    - New email + name provided  → creates account, sends OTP
    - New email + no name        → returns detail='new_user' (frontend shows name fields)
    - Existing email             → sends a new OTP
    """
    return await auth_service.request_otp(db, body)


@router.post(
    "/verify-otp",
    response_model=Token,
    summary="Step 2 — Verify the OTP code and receive JWT tokens",
)
def verify_otp(body: OTPVerify, db: Session = Depends(get_db)):
    """
    Validate the 6-digit code. On success returns access + refresh tokens.
    After 5 wrong attempts the code is invalidated.
    """
    return auth_service.verify_otp(db, body.email, body.otp_code)


@router.post(
    "/refresh",
    response_model=Token,
    summary="Exchange a refresh token for a new access token",
)
def refresh_token(body: RefreshTokenRequest, db: Session = Depends(get_db)):
    return auth_service.refresh_access_token(db, body.refresh_token)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the current logged-in user's profile",
)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put(
    "/me",
    response_model=UserResponse,
    summary="Update the current user's name",
)
def update_me(
    body: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.first_name is not None:
        current_user.first_name = body.first_name.strip()
    if body.last_name is not None:
        current_user.last_name = body.last_name.strip()
    if body.phone is not None:
        current_user.phone = body.phone.strip() or None
    db.commit()
    db.refresh(current_user)
    return current_user
