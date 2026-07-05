"""add_subscriptions

Revision ID: b3c9d2e1f0a4
Revises: a12e4a17293e
Create Date: 2026-07-05 12:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from alembic import op

revision: str = "b3c9d2e1f0a4"
down_revision: Union[str, None] = "a12e4a17293e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

planname_enum = sa.Enum("starter", "pro", "enterprise", name="planname")
subscriptionstatus_enum = sa.Enum(
    "active", "trialing", "past_due", "canceled", "incomplete",
    name="subscriptionstatus",
)


def upgrade() -> None:
    op.create_table(
        "subscriptions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "company_id",
            UUID(as_uuid=True),
            sa.ForeignKey("companies.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("plan", planname_enum, nullable=False, server_default="starter"),
        sa.Column("status", subscriptionstatus_enum, nullable=False, server_default="active"),
        sa.Column("stripe_customer_id", sa.String(255), nullable=True, unique=True),
        sa.Column("stripe_subscription_id", sa.String(255), nullable=True, unique=True),
        sa.Column("stripe_price_id", sa.String(255), nullable=True),
        sa.Column("current_period_start", sa.DateTime(timezone=True), nullable=True),
        sa.Column("current_period_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancel_at_period_end", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_subscriptions_company_id", "subscriptions", ["company_id"])


def downgrade() -> None:
    op.drop_index("ix_subscriptions_company_id", table_name="subscriptions")
    op.drop_table("subscriptions")
    planname_enum.drop(op.get_bind(), checkfirst=True)
    subscriptionstatus_enum.drop(op.get_bind(), checkfirst=True)
