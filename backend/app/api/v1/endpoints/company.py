"""
Company API Endpoints
Routes for creating a company, managing profile, inviting & managing team members.
"""
import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.company import (
    CompanyCreate,
    CompanyResponse,
    CompanyUpdate,
    InvitationResponse,
    InviteMemberRequest,
    MemberResponse,
    UpdateMemberRoleRequest,
)
from app.schemas.user import MessageResponse
from app.services import company as company_service
from app.models.company import Company, CompanyInvitation
from fastapi import HTTPException

router = APIRouter()


def _require_company(current_user: User = Depends(get_current_user)) -> User:
    """Dependency: user must already belong to a company."""
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not part of any company yet. Please set up or join a company first.",
        )
    return current_user


# ── Create / Setup ────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=CompanyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new company (current user becomes Admin)",
)
def create_company(
    body: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return company_service.create_company(db, current_user, body)


# ── Company Profile ───────────────────────────────────────────────────────────

@router.get(
    "/me",
    response_model=CompanyResponse,
    summary="Get current user's company profile",
)
def get_my_company(
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_company),
):
    return company_service.get_company_by_id(db, current_user.company_id)


@router.put(
    "/me",
    response_model=CompanyResponse,
    summary="Update company profile (Admin only)",
)
def update_my_company(
    body: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    company = company_service.get_company_by_id(db, current_user.company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found.")
    return company_service.update_company(db, company, body)


# ── Team Management ───────────────────────────────────────────────────────────

@router.get(
    "/me/members",
    response_model=list[MemberResponse],
    summary="Get all team members",
)
def get_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_company),
):
    return company_service.get_company_members(db, current_user.company_id)


@router.post(
    "/me/invite",
    response_model=MessageResponse,
    summary="Invite a new team member by email (Admin only)",
)
async def invite_member(
    body: InviteMemberRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    company = company_service.get_company_by_id(db, current_user.company_id)
    await company_service.invite_member(db, company, current_user, body)
    return {"message": f"Invitation sent to {body.email}."}


@router.put(
    "/me/members/{user_id}/role",
    response_model=MemberResponse,
    summary="Change a team member's role (Admin only)",
)
def update_member_role(
    user_id: uuid.UUID,
    body: UpdateMemberRoleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    return company_service.update_member_role(
        db, current_user.company_id, user_id, body.role, current_user
    )


@router.delete(
    "/me/members/{user_id}",
    response_model=MessageResponse,
    summary="Remove a team member (Admin only)",
)
def remove_member(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    company_service.remove_member(db, current_user.company_id, user_id, current_user)
    return {"message": "Member removed from company."}


# ── Invitations ───────────────────────────────────────────────────────────────

@router.get(
    "/invite/{token}",
    response_model=InvitationResponse,
    summary="Get invitation details by token (shown before accepting)",
)
def get_invitation(token: str, db: Session = Depends(get_db)):
    inv = company_service.get_invitation_by_token(db, token)
    company = company_service.get_company_by_id(db, inv.company_id)
    return InvitationResponse(
        id=inv.id,
        email=inv.email,
        role=inv.role,
        company_name=company.name if company else "Unknown",
        expires_at=inv.expires_at,
    )


@router.post(
    "/invite/{token}/accept",
    response_model=CompanyResponse,
    summary="Accept a team invitation (must be logged in)",
)
def accept_invitation(
    token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    company = company_service.accept_invitation(db, token, current_user)
    return company
