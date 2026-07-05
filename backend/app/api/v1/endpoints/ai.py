from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_db
from app.models.ai_report import AIReport
from app.models.user import User
from app.schemas.ai_report import (
    AIReportResponse,
    ChatRequest,
    ChatResponse,
    ReportGenerateRequest,
)
from app.services import ai as ai_service

router = APIRouter()

_AI_NOT_CONFIGURED = HTTPException(
    status_code=503,
    detail="AI features are not configured. Add your ANTHROPIC_API_KEY to the .env file.",
)


def _require_ai():
    if not ai_service._ai_enabled():
        raise _AI_NOT_CONFIGURED


# ── STATIC routes first (must come before /{report_id}) ───────────────────────

@router.get("/reports", response_model=list[AIReportResponse])
def list_reports(
    project_id: UUID | None = None,
    report_type: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="You do not belong to a company.")
    q = db.query(AIReport).filter(AIReport.company_id == current_user.company_id)
    if project_id:
        q = q.filter(AIReport.project_id == project_id)
    if report_type:
        q = q.filter(AIReport.report_type == report_type)
    return q.order_by(AIReport.created_at.desc()).all()


@router.post("/reports/generate", response_model=AIReportResponse)
def generate_report(
    body: ReportGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_ai()
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="You do not belong to a company.")
    try:
        report = ai_service.generate_report(
            db=db,
            company_id=current_user.company_id,
            project_id=body.project_id,
            report_type=body.report_type,
            extra_context=body.extra_context,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {exc}")
    return report


@router.post("/chat", response_model=ChatResponse)
def chat(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_ai()
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="You do not belong to a company.")
    if not body.messages:
        raise HTTPException(status_code=400, detail="Messages list cannot be empty.")
    try:
        messages = [{"role": m.role, "content": m.content} for m in body.messages]
        text, input_tok, output_tok = ai_service.chat(messages)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI chat failed: {exc}")
    return ChatResponse(message=text, input_tokens=input_tok, output_tokens=output_tok)


# ── PARAMETRIC routes after statics ───────────────────────────────────────────

@router.get("/reports/{report_id}", response_model=AIReportResponse)
def get_report(
    report_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(AIReport).filter(
        AIReport.id == report_id,
        AIReport.company_id == current_user.company_id,
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    return report


@router.delete("/reports/{report_id}")
def delete_report(
    report_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(AIReport).filter(
        AIReport.id == report_id,
        AIReport.company_id == current_user.company_id,
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    db.delete(report)
    db.commit()
    return {"message": "Report deleted."}
