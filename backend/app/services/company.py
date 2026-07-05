"""
Company Service — Business Logic
All company-related operations: create, update, invite, accept invite, manage members.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.email import send_invitation_email
from app.core.security import generate_secure_token
from app.models.company import Company, CompanyInvitation
from app.models.subscription import Subscription
from app.models.user import User, UserRole
from app.schemas.company import CompanyCreate, CompanyUpdate, InviteMemberRequest

INVITATION_EXPIRE_DAYS = 7


def get_company_by_id(db: Session, company_id: uuid.UUID) -> Optional[Company]:
    return db.query(Company).filter(Company.id == company_id).first()


def get_user_company(db: Session, user: User) -> Optional[Company]:
    if not user.company_id:
        return None
    return get_company_by_id(db, user.company_id)


def create_company(db: Session, user: User, company_in: CompanyCreate) -> Company:
    """
    Create a new company and make the current user its Admin.
    One user can only belong to one company at a time.
    """
    if user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already belong to a company. Leave your current company first.",
        )

    company = Company(
        name=company_in.name.strip(),
        industry=company_in.industry,
        country=company_in.country,
        city=company_in.city,
        address=company_in.address,
        phone=company_in.phone,
        website=company_in.website,
    )
    db.add(company)
    db.flush()  # get company.id without committing yet

    # Link the user to the new company as Admin
    user.company_id = company.id
    user.role = UserRole.ADMIN

    # Auto-create a Starter subscription for the new company
    subscription = Subscription(company_id=company.id)
    db.add(subscription)

    db.commit()
    db.refresh(company)
    return company


def update_company(db: Session, company: Company, data: CompanyUpdate) -> Company:
    """Update company fields — only provided (non-None) fields are changed."""
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(company, field, value)
    db.commit()
    db.refresh(company)
    return company


def get_company_members(db: Session, company_id: uuid.UUID) -> list[User]:
    """Return all active users who belong to this company."""
    return (
        db.query(User)
        .filter(User.company_id == company_id, User.is_active == True)
        .order_by(User.created_at)
        .all()
    )


async def invite_member(
    db: Session,
    company: Company,
    inviter: User,
    invite_in: InviteMemberRequest,
) -> CompanyInvitation:
    """
    Send an invitation email to a new team member.
    - If the email already belongs to a user in this company, raise an error.
    - If a pending invitation already exists for this email, resend it.
    """
    email = invite_in.email.lower().strip()

    # Check if user already in this company
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user and existing_user.company_id == company.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This person is already a member of your company.",
        )

    # Reuse or create invitation
    invitation = (
        db.query(CompanyInvitation)
        .filter(
            CompanyInvitation.company_id == company.id,
            CompanyInvitation.email == email,
            CompanyInvitation.accepted_at == None,
        )
        .first()
    )

    if invitation:
        # Refresh the token and expiry
        invitation.token = generate_secure_token()
        invitation.role = invite_in.role
        invitation.expires_at = datetime.now(timezone.utc) + timedelta(days=INVITATION_EXPIRE_DAYS)
    else:
        invitation = CompanyInvitation(
            company_id=company.id,
            invited_by_id=inviter.id,
            email=email,
            role=invite_in.role,
            token=generate_secure_token(),
            expires_at=datetime.now(timezone.utc) + timedelta(days=INVITATION_EXPIRE_DAYS),
        )
        db.add(invitation)

    db.commit()
    db.refresh(invitation)

    await send_invitation_email(
        to_email=email,
        company_name=company.name,
        inviter_name=inviter.full_name(),
        role=invite_in.role.value.replace("_", " ").title(),
        token=invitation.token,
    )
    return invitation


def get_invitation_by_token(db: Session, token: str) -> CompanyInvitation:
    """Fetch a pending invitation by its token — raises 400 if invalid/expired/used."""
    inv = (
        db.query(CompanyInvitation)
        .filter(CompanyInvitation.token == token)
        .first()
    )
    if not inv:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid invitation link.",
        )
    if inv.accepted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This invitation has already been used.",
        )
    if inv.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This invitation has expired. Ask your Admin to send a new one.",
        )
    return inv


def accept_invitation(db: Session, token: str, user: User) -> Company:
    """
    Link an existing user to a company via invitation token.
    The user must be verified. They cannot already be in a company.
    """
    if not user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address before accepting an invitation.",
        )

    if user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already belong to a company. Leave it before accepting a new invitation.",
        )

    inv = get_invitation_by_token(db, token)

    if inv.email != user.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This invitation was sent to a different email address.",
        )

    company = get_company_by_id(db, inv.company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company no longer exists.",
        )

    user.company_id = company.id
    user.role = inv.role
    inv.accepted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return company


def remove_member(db: Session, company_id: uuid.UUID, user_id: uuid.UUID, requester: User) -> None:
    """Remove a user from the company. Only Admins can do this."""
    if str(user_id) == str(requester.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove yourself. Transfer Admin role first.",
        )

    member = db.query(User).filter(
        User.id == user_id, User.company_id == company_id
    ).first()

    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")

    member.company_id = None
    member.role = UserRole.PROJECT_MANAGER
    db.commit()


def update_member_role(
    db: Session, company_id: uuid.UUID, user_id: uuid.UUID, new_role: UserRole, requester: User
) -> User:
    """Change a team member's role. Only Admins can do this."""
    if str(user_id) == str(requester.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own role.",
        )

    member = db.query(User).filter(
        User.id == user_id, User.company_id == company_id
    ).first()

    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")

    member.role = new_role
    db.commit()
    db.refresh(member)
    return member
