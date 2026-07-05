"""
Billing Endpoints — Subscription management via Stripe
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_db
from app.core.config import settings
from app.models.user import User
from app.schemas.subscription import CheckoutSessionResponse, PortalSessionResponse, SubscriptionResponse
from app.services import billing as billing_svc

router = APIRouter()


@router.get("/subscription", response_model=SubscriptionResponse)
def get_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="You do not belong to a company.")
    sub = billing_svc.get_or_create_subscription(db, current_user.company_id)
    return sub


@router.post("/checkout/{plan}", response_model=CheckoutSessionResponse)
def create_checkout(
    plan: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if plan not in ("pro", "enterprise"):
        raise HTTPException(status_code=400, detail="Invalid plan. Choose 'pro' or 'enterprise'.")
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="You do not belong to a company.")

    try:
        url = billing_svc.create_checkout_session(
            db=db,
            company_id=current_user.company_id,
            plan=plan,
            user_email=current_user.email,
            success_url=f"{settings.FRONTEND_URL}/billing?success=true",
            cancel_url=f"{settings.FRONTEND_URL}/billing?canceled=true",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"url": url}


@router.post("/portal", response_model=PortalSessionResponse)
def create_portal(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="You do not belong to a company.")

    try:
        url = billing_svc.create_portal_session(
            db=db,
            company_id=current_user.company_id,
            return_url=f"{settings.FRONTEND_URL}/billing",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"url": url}


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        billing_svc.handle_webhook(db, payload, sig_header)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"status": "ok"}
