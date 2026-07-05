"""
Billing Service — Stripe integration
Handles checkout sessions, customer portal, and webhook processing.
"""
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

import stripe
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.subscription import PlanName, Subscription, SubscriptionStatus

logger = logging.getLogger(__name__)

PLAN_PRICE_MAP: dict[str, str] = {
    "pro": settings.STRIPE_PRICE_PRO_MONTHLY,
    "enterprise": settings.STRIPE_PRICE_ENTERPRISE_MONTHLY,
}

PLAN_LIMITS = {
    PlanName.starter:    {"users": 3,   "projects": 1},
    PlanName.pro:        {"users": 25,  "projects": 999},
    PlanName.enterprise: {"users": 999, "projects": 999},
}


def _stripe_enabled() -> bool:
    return bool(settings.STRIPE_SECRET_KEY and not settings.STRIPE_SECRET_KEY.endswith("REPLACE_ME"))


def get_or_create_subscription(db: Session, company_id: uuid.UUID) -> Subscription:
    sub = db.query(Subscription).filter(Subscription.company_id == company_id).first()
    if not sub:
        sub = Subscription(company_id=company_id)
        db.add(sub)
        db.commit()
        db.refresh(sub)
    return sub


def create_checkout_session(
    db: Session,
    company_id: uuid.UUID,
    plan: str,
    user_email: str,
    success_url: str,
    cancel_url: str,
) -> str:
    if not _stripe_enabled():
        raise ValueError("Stripe is not configured. Add your Stripe keys to .env")

    price_id = PLAN_PRICE_MAP.get(plan)
    if not price_id or price_id.endswith("REPLACE_ME"):
        raise ValueError(f"Stripe price ID for '{plan}' plan is not configured in .env")

    stripe.api_key = settings.STRIPE_SECRET_KEY
    sub = get_or_create_subscription(db, company_id)

    customer_id = sub.stripe_customer_id
    if not customer_id:
        customer = stripe.Customer.create(email=user_email, metadata={"company_id": str(company_id)})
        customer_id = customer.id
        sub.stripe_customer_id = customer_id
        db.commit()

    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"company_id": str(company_id), "plan": plan},
    )
    return session.url


def create_portal_session(
    db: Session,
    company_id: uuid.UUID,
    return_url: str,
) -> str:
    if not _stripe_enabled():
        raise ValueError("Stripe is not configured. Add your Stripe keys to .env")

    stripe.api_key = settings.STRIPE_SECRET_KEY
    sub = get_or_create_subscription(db, company_id)

    if not sub.stripe_customer_id:
        raise ValueError("No billing account found. Please upgrade to a paid plan first.")

    session = stripe.billing_portal.Session.create(
        customer=sub.stripe_customer_id,
        return_url=return_url,
    )
    return session.url


def handle_webhook(db: Session, payload: bytes, sig_header: str) -> None:
    if not _stripe_enabled():
        return

    stripe.api_key = settings.STRIPE_SECRET_KEY
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except (stripe.error.SignatureVerificationError, ValueError) as e:
        raise ValueError(f"Invalid webhook signature: {e}")

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type in ("customer.subscription.created", "customer.subscription.updated"):
        _sync_subscription(db, data)
    elif event_type == "customer.subscription.deleted":
        _cancel_subscription(db, data)
    elif event_type == "invoice.payment_failed":
        _mark_past_due(db, data)


def _sync_subscription(db: Session, stripe_sub: dict) -> None:
    company_id_str = stripe_sub.get("metadata", {}).get("company_id")
    if not company_id_str:
        return

    company_id = uuid.UUID(company_id_str)
    sub = get_or_create_subscription(db, company_id)

    stripe_status = stripe_sub["status"]
    status_map = {
        "active": SubscriptionStatus.active,
        "trialing": SubscriptionStatus.trialing,
        "past_due": SubscriptionStatus.past_due,
        "canceled": SubscriptionStatus.canceled,
        "incomplete": SubscriptionStatus.incomplete,
    }

    price_id = stripe_sub["items"]["data"][0]["price"]["id"] if stripe_sub.get("items") else None
    plan = PlanName.starter
    for plan_name, pid in PLAN_PRICE_MAP.items():
        if pid == price_id:
            plan = PlanName(plan_name)
            break

    sub.stripe_subscription_id = stripe_sub["id"]
    sub.stripe_price_id = price_id
    sub.plan = plan
    sub.status = status_map.get(stripe_status, SubscriptionStatus.active)
    sub.cancel_at_period_end = stripe_sub.get("cancel_at_period_end", False)

    if stripe_sub.get("current_period_start"):
        sub.current_period_start = datetime.fromtimestamp(stripe_sub["current_period_start"], tz=timezone.utc)
    if stripe_sub.get("current_period_end"):
        sub.current_period_end = datetime.fromtimestamp(stripe_sub["current_period_end"], tz=timezone.utc)

    db.commit()


def _cancel_subscription(db: Session, stripe_sub: dict) -> None:
    company_id_str = stripe_sub.get("metadata", {}).get("company_id")
    if not company_id_str:
        return
    sub = db.query(Subscription).filter(
        Subscription.company_id == uuid.UUID(company_id_str)
    ).first()
    if sub:
        sub.plan = PlanName.starter
        sub.status = SubscriptionStatus.canceled
        sub.stripe_subscription_id = None
        sub.stripe_price_id = None
        db.commit()


def _mark_past_due(db: Session, invoice: dict) -> None:
    customer_id = invoice.get("customer")
    if not customer_id:
        return
    sub = db.query(Subscription).filter(
        Subscription.stripe_customer_id == customer_id
    ).first()
    if sub:
        sub.status = SubscriptionStatus.past_due
        db.commit()
