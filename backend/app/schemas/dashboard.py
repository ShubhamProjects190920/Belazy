import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class RecentProject(BaseModel):
    id: uuid.UUID
    name: str
    status: str
    priority: str
    client_name: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class StatusBreakdown(BaseModel):
    status: str
    label: str
    count: int
    percentage: float


class DashboardStats(BaseModel):
    total_projects: int
    active_projects: int
    on_hold_projects: int
    completed_projects: int
    planning_projects: int
    total_budget: Optional[float]
    team_members: int
    plan: str
    recent_projects: list[RecentProject]
    status_breakdown: list[StatusBreakdown]
