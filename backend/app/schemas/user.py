"""
User Schemas — OTP Authentication
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator

from app.models.user import UserRole


class OTPRequest(BaseModel):
    """Step 1 — user submits their email (and name if registering)."""
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class OTPVerify(BaseModel):
    """Step 2 — user submits the 6-digit code they received by email."""
    email: EmailStr
    otp_code: str

    @field_validator("otp_code")
    @classmethod
    def must_be_6_digits(cls, v: str) -> str:
        v = v.strip()
        if not v.isdigit() or len(v) != 6:
            raise ValueError("OTP must be exactly 6 digits.")
        return v


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool
    is_email_verified: bool
    company_id: Optional[uuid.UUID]
    phone: Optional[str]
    last_login_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None


class MessageResponse(BaseModel):
    message: str
