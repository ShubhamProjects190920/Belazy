import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, field_validator

from app.models.project import ProjectPriority, ProjectStatus


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    client_name: Optional[str] = None
    location: Optional[str] = None
    status: ProjectStatus = ProjectStatus.planning
    priority: ProjectPriority = ProjectPriority.medium
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Project name cannot be empty.")
        return v.strip()


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    client_name: Optional[str] = None
    location: Optional[str] = None
    status: Optional[ProjectStatus] = None
    priority: Optional[ProjectPriority] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None


class ProjectResponse(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    created_by_id: Optional[uuid.UUID]
    name: str
    description: Optional[str]
    client_name: Optional[str]
    location: Optional[str]
    status: ProjectStatus
    priority: ProjectPriority
    start_date: Optional[date]
    end_date: Optional[date]
    budget: Optional[float]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
