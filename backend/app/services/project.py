import uuid
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.user import User, UserRole
from app.schemas.project import ProjectCreate, ProjectUpdate


def get_projects(db: Session, company_id: uuid.UUID) -> list[Project]:
    return (
        db.query(Project)
        .filter(Project.company_id == company_id)
        .order_by(Project.created_at.desc())
        .all()
    )


def get_project(db: Session, project_id: uuid.UUID, company_id: uuid.UUID) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id, Project.company_id == company_id
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    return project


def create_project(db: Session, data: ProjectCreate, user: User) -> Project:
    project = Project(
        company_id=user.company_id,
        created_by_id=user.id,
        name=data.name,
        description=data.description,
        client_name=data.client_name,
        location=data.location,
        status=data.status,
        priority=data.priority,
        start_date=data.start_date,
        end_date=data.end_date,
        budget=data.budget,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project: Project, data: ProjectUpdate) -> Project:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project: Project, user: User) -> None:
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Admins can delete projects.",
        )
    db.delete(project)
    db.commit()
