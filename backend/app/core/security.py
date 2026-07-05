"""
Security Utilities
- Password hashing with bcrypt
- JWT access and refresh tokens
- Secure random token generator (for email verification & password reset)
"""
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Union

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# bcrypt password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check if a plain text password matches the stored bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a plain text password using bcrypt."""
    return pwd_context.hash(password)


def create_access_token(subject: Union[str, int]) -> str:
    """
    Create a short-lived JWT access token.
    The 'sub' field contains the user's ID.
    Expires after ACCESS_TOKEN_EXPIRE_MINUTES (default: 30 min).
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": str(subject), "type": "access", "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: Union[str, int]) -> str:
    """
    Create a long-lived JWT refresh token.
    Expires after REFRESH_TOKEN_EXPIRE_DAYS (default: 7 days).
    Used to get a new access token without re-logging in.
    """
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    payload = {"sub": str(subject), "type": "refresh", "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """
    Decode and validate a JWT token.
    Returns the payload dict, or None if the token is invalid/expired.
    """
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


def generate_secure_token() -> str:
    """Generate a cryptographically secure random URL-safe token (for invitations)."""
    return secrets.token_urlsafe(32)


def generate_otp() -> str:
    """Generate a random 6-digit OTP code (e.g. 482901)."""
    return str(secrets.randbelow(900000) + 100000)
