from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_db
from app.models.project import Project, ProjectStatus
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.dashboard import DashboardStats, RecentProject, StatusBreakdown

router = APIRouter()

STATUS_LABELS = {
    "planning":  "Planning",
    "active":    "Active",
    "on_hold":   "On Hold",
    "completed": "Completed",
    "canceled":  "Canceled",
}


@router.get("", response_model=DashboardStats)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="You do not belong to a company.")

    cid = current_user.company_id

    # Count projects by status in one query
    status_counts = (
        db.query(Project.status, func.count(Project.id))
        .filter(Project.company_id == cid)
        .group_by(Project.status)
        .all()
    )
    counts_by_status: dict[str, int] = {s.value: c for s, c in status_counts}
    total = sum(counts_by_status.values())

    # Total budget
    budget_sum = (
        db.query(func.sum(Project.budget))
        .filter(Project.company_id == cid)
        .scalar()
    )

    # Team member count
    team_count = (
        db.query(func.count(User.id))
        .filter(User.company_id == cid, User.is_active == True)
        .scalar()
        or 0
    )

    # Subscription plan
    sub = db.query(Subscription).filter(Subscription.company_id == cid).first()
    plan = sub.plan.value if sub else "starter"

    # Recent projects (last 5)
    recent = (
        db.query(Project)
        .filter(Project.company_id == cid)
        .order_by(Project.created_at.desc())
        .limit(5)
        .all()
    )

    # Status breakdown for display
    breakdown = []
    for status_val in ["active", "planning", "on_hold", "completed", "canceled"]:
        count = counts_by_status.get(status_val, 0)
        pct = round((count / total * 100), 1) if total > 0 else 0.0
        breakdown.append(StatusBreakdown(
            status=status_val,
            label=STATUS_LABELS[status_val],
            count=count,
            percentage=pct,
        ))

    return DashboardStats(
        total_projects=total,
        active_projects=counts_by_status.get("active", 0),
        on_hold_projects=counts_by_status.get("on_hold", 0),
        completed_projects=counts_by_status.get("completed", 0),
        planning_projects=counts_by_status.get("planning", 0),
        total_budget=float(budget_sum) if budget_sum else None,
        team_members=team_count,
        plan=plan,
        recent_projects=[RecentProject.model_validate(p) for p in recent],
        status_breakdown=breakdown,
    )
