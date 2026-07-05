import uuid
from datetime import date

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.schemas.user import MessageResponse
from app.services import excel as excel_svc
from app.services import project as project_svc

router = APIRouter()


def _require_company(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="You do not belong to a company.")
    return current_user


# ── Static routes MUST come before /{project_id} ─────────────────────────────
# FastAPI matches in order — if /{project_id} came first, "export" would be
# treated as a UUID and fail with a validation error.

@router.get("/export")
def export_projects(
    current_user: User = Depends(_require_company),
    db: Session = Depends(get_db),
):
    projects = project_svc.get_projects(db, current_user.company_id)
    buf = excel_svc.export_projects(projects)
    filename = f"projects_{date.today().strftime('%Y%m%d')}.xlsx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/import/template")
def download_template():
    buf = excel_svc.generate_template()
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=projects_template.xlsx"},
    )


@router.post("/import")
async def import_projects(
    file: UploadFile = File(...),
    current_user: User = Depends(_require_company),
    db: Session = Depends(get_db),
):
    if not file.filename or not file.filename.lower().endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Please upload an Excel file (.xlsx).")

    content = await file.read()

    try:
        rows, parse_errors = excel_svc.parse_import(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read Excel file: {e}")

    imported = 0
    for row in rows:
        try:
            project_svc.create_project(db, ProjectCreate(**row), current_user)
            imported += 1
        except Exception:
            parse_errors.append(f"Could not create project '{row.get('name', '?')}'.")

    return {
        "imported": imported,
        "skipped":  len(parse_errors),
        "errors":   parse_errors[:10],
    }


# ── CRUD ──────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[ProjectResponse])
def list_projects(
    current_user: User = Depends(_require_company),
    db: Session = Depends(get_db),
):
    return project_svc.get_projects(db, current_user.company_id)


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    body: ProjectCreate,
    current_user: User = Depends(_require_company),
    db: Session = Depends(get_db),
):
    return project_svc.create_project(db, body, current_user)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: uuid.UUID,
    current_user: User = Depends(_require_company),
    db: Session = Depends(get_db),
):
    return project_svc.get_project(db, project_id, current_user.company_id)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: uuid.UUID,
    body: ProjectUpdate,
    current_user: User = Depends(_require_company),
    db: Session = Depends(get_db),
):
    project = project_svc.get_project(db, project_id, current_user.company_id)
    return project_svc.update_project(db, project, body)


@router.delete("/{project_id}", response_model=MessageResponse)
def delete_project(
    project_id: uuid.UUID,
    current_user: User = Depends(_require_company),
    db: Session = Depends(get_db),
):
    project = project_svc.get_project(db, project_id, current_user.company_id)
    project_svc.delete_project(db, project, current_user)
    return {"message": "Project deleted."}
