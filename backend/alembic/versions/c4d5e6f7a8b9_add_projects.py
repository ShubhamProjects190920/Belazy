"""add_projects

Revision ID: c4d5e6f7a8b9
Revises: b3c9d2e1f0a4
Create Date: 2026-07-05 13:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from alembic import op

revision: str = "c4d5e6f7a8b9"
down_revision: Union[str, None] = "b3c9d2e1f0a4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

projectstatus_enum = sa.Enum(
    "planning", "active", "on_hold", "completed", "canceled",
    name="projectstatus",
)
projectpriority_enum = sa.Enum(
    "low", "medium", "high", "critical",
    name="projectpriority",
)


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "company_id",
            UUID(as_uuid=True),
            sa.ForeignKey("companies.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "created_by_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("client_name", sa.String(255), nullable=True),
        sa.Column("location", sa.String(500), nullable=True),
        sa.Column("status", projectstatus_enum, nullable=False, server_default="planning"),
        sa.Column("priority", projectpriority_enum, nullable=False, server_default="medium"),
        sa.Column("start_date", sa.Date, nullable=True),
        sa.Column("end_date", sa.Date, nullable=True),
        sa.Column("budget", sa.Numeric(15, 2), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_projects_company_id", "projects", ["company_id"])


def downgrade() -> None:
    op.drop_index("ix_projects_company_id", table_name="projects")
    op.drop_table("projects")
    projectstatus_enum.drop(op.get_bind(), checkfirst=True)
    projectpriority_enum.drop(op.get_bind(), checkfirst=True)
