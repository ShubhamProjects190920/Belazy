from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_db
from app.models.ai_report import AIReport
from app.models.company import Company
from app.models.project import Project
from app.models.user import User
from app.schemas.report import EmailReportRequest
from app.services import report as report_svc

router = APIRouter()


def _company_name(db: Session, company_id) -> str:
    co = db.query(Company).filter(Company.id == company_id).first()
    return co.name if co else "Unknown Company"


def _require_company(user: User):
    if not user.company_id:
        raise HTTPException(status_code=400, detail="You do not belong to a company.")


# ── STATIC routes first ────────────────────────────────────────────────────────

@router.get("/project-summary/pdf")
def download_project_summary_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_company(current_user)
    projects = (
        db.query(Project)
        .filter(Project.company_id == current_user.company_id)
        .order_by(Project.created_at.desc())
        .all()
    )
    company_name = _company_name(db, current_user.company_id)
    buf = report_svc.generate_project_summary_pdf(projects, company_name)
    filename = f"project_summary_{date.today()}.pdf"
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/project-summary/pptx")
def download_project_pptx(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_company(current_user)
    projects = (
        db.query(Project)
        .filter(Project.company_id == current_user.company_id)
        .order_by(Project.created_at.desc())
        .all()
    )
    company_name = _company_name(db, current_user.company_id)
    buf = report_svc.generate_project_ppt(projects, company_name)
    filename = f"project_status_{date.today()}.pptx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ── PARAMETRIC routes after statics ───────────────────────────────────────────

@router.get("/ai-reports/{report_id}/pdf")
def download_ai_report_pdf(
    report_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_company(current_user)
    report = db.query(AIReport).filter(
        AIReport.id == report_id,
        AIReport.company_id == current_user.company_id,
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    company_name = _company_name(db, current_user.company_id)
    buf = report_svc.generate_ai_report_pdf(report, company_name)
    safe = report.title.replace("/", "-").replace("\\", "-")
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{safe}.pdf"'},
    )


@router.post("/ai-reports/{report_id}/email")
async def email_ai_report(
    report_id: UUID,
    body: EmailReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_company(current_user)
    report = db.query(AIReport).filter(
        AIReport.id == report_id,
        AIReport.company_id == current_user.company_id,
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    company_name = _company_name(db, current_user.company_id)
    buf = report_svc.generate_ai_report_pdf(report, company_name)
    sent = await report_svc.send_report_email(
        to_email=str(body.to_email),
        report_title=report.title,
        pdf_bytes=buf.read(),
        company_name=company_name,
        sender_name=f"{current_user.first_name} {current_user.last_name}",
    )
    if not sent:
        raise HTTPException(
            status_code=503,
            detail="Email service not configured. Set SMTP credentials in .env.",
        )
    return {"message": f"Report sent to {body.to_email}"}
