"""
Company Schemas
Pydantic models for company-related API requests and responses.
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, HttpUrl

from app.models.user import UserRole
from app.schemas.user import UserResponse


class CompanyCreate(BaseModel):
    """Body for POST /company — create a new company."""
    name: str
    industry: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None


class CompanyUpdate(BaseModel):
    """Body for PUT /company/me — all fields optional."""
    name: Optional[str] = None
    industry: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None


class CompanyResponse(BaseModel):
    """Full company object returned by the API."""
    id: uuid.UUID
    name: str
    industry: Optional[str]
    country: Optional[str]
    city: Optional[str]
    address: Optional[str]
    phone: Optional[str]
    website: Optional[str]
    logo_url: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class InviteMemberRequest(BaseModel):
    """Body for POST /company/me/invite."""
    email: str
    role: UserRole


class UpdateMemberRoleRequest(BaseModel):
    """Body for PUT /company/me/members/{user_id}/role."""
    role: UserRole


class InvitationResponse(BaseModel):
    """Details of a pending invitation (returned when checking token)."""
    id: uuid.UUID
    email: str
    role: UserRole
    company_name: str
    expires_at: datetime

    model_config = {"from_attributes": True}


class MemberResponse(BaseModel):
    """A team member as returned in the members list."""
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool
    last_login_at: Optional[datetime]

    model_config = {"from_attributes": True}
