from datetime import date
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.ai_report import AIReport, AIReportType
from app.models.project import Project


def _ai_enabled() -> bool:
    key = settings.ANTHROPIC_API_KEY
    return bool(key) and not key.upper().endswith("REPLACE_ME")


def _client():
    from anthropic import Anthropic
    return Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def _project_context(project: Project) -> str:
    parts = [f"Project Name: {project.name}"]
    if project.client_name:
        parts.append(f"Client: {project.client_name}")
    if project.location:
        parts.append(f"Location: {project.location}")
    parts.append(f"Status: {project.status.value.replace('_', ' ').title()}")
    parts.append(f"Priority: {project.priority.value.title()}")
    if project.start_date:
        parts.append(f"Start Date: {project.start_date}")
    if project.end_date:
        parts.append(f"End Date: {project.end_date}")
    if project.budget:
        parts.append(f"Budget: ₹{float(project.budget):,.2f}")
    if project.description:
        parts.append(f"Description: {project.description}")
    return "\n".join(parts)


_SYSTEM_REPORT = (
    "You are an expert construction project manager and professional technical writer. "
    "Generate structured, professional project reports for construction companies in India. "
    "Use markdown formatting: ## for headings, ### for sub-headings, **text** for bold, "
    "- for bullet points. Be concise, specific, and practical. "
    "Use ₹ for all monetary values."
)


def generate_report(
    db: Session,
    company_id: UUID,
    project_id: UUID,
    report_type: str,
    extra_context: Optional[str] = None,
) -> AIReport:
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.company_id == company_id,
    ).first()
    if not project:
        raise ValueError("Project not found")

    today = date.today().strftime("%d %B %Y")
    ctx = _project_context(project)
    extra = f"\n\nAdditional context from the user:\n{extra_context}" if extra_context else ""

    prompts = {
        "daily":   (_dpr_prompt, "Daily Progress Report (DPR)"),
        "weekly":  (_wpr_prompt, "Weekly Progress Report (WPR)"),
        "monthly": (_mpr_prompt, "Monthly Progress Report (MPR)"),
    }
    prompt_fn, type_label = prompts.get(report_type, prompts["daily"])
    prompt = prompt_fn(project.name, today, ctx, extra)

    response = _client().messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        system=_SYSTEM_REPORT,
        messages=[{"role": "user", "content": prompt}],
    )

    content = response.content[0].text
    tokens = response.usage.input_tokens + response.usage.output_tokens

    report = AIReport(
        company_id=company_id,
        project_id=project_id,
        report_type=AIReportType(report_type),
        title=f"{type_label} — {project.name} ({today})",
        content=content,
        tokens_used=tokens,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def chat(messages: list[dict]) -> tuple[str, int, int]:
    response = _client().messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=(
            "You are an AI assistant for AI Project Controls, a construction project management platform. "
            "Help users with project management questions, construction best practices, "
            "schedule analysis, budget management, and risk mitigation. "
            "Be concise, practical, and use Indian construction context where relevant."
        ),
        messages=messages,
    )
    text = response.content[0].text
    return text, response.usage.input_tokens, response.usage.output_tokens


def _dpr_prompt(project_name: str, today: str, ctx: str, extra: str) -> str:
    return f"""Generate a Daily Progress Report (DPR) for this construction project.

**Project Details:**
{ctx}{extra}

Write the full report using this exact structure:

## Daily Progress Report
**Date:** {today}
**Project:** {project_name}

### Executive Summary
(2-3 sentences on today's overall progress)

### Work Completed Today
(Bullet list of completed activities)

### Resources Deployed
- **Manpower:** (workers by trade)
- **Equipment:** (key equipment used)
- **Materials Consumed:** (key materials)

### Issues & Blockers
(Bullet list of problems. Write "None reported." if none)

### Safety Observations
(Safety notes or near-misses. Write "No incidents." if none)

### Quality Checks
(Inspections or tests done today)

### Plan for Tomorrow
(Bullet list of planned activities)

### Progress Snapshot
- **Schedule Status:** (On Track / Delayed X days / Ahead by X days)
- **Cumulative Completion:** (X%)"""


def _wpr_prompt(project_name: str, today: str, ctx: str, extra: str) -> str:
    return f"""Generate a Weekly Progress Report (WPR) for this construction project.

**Project Details:**
{ctx}{extra}

Write the full report using this exact structure:

## Weekly Progress Report
**Week Ending:** {today}
**Project:** {project_name}

### Week Summary
(3-4 sentences on the week's highlights and overall health)

### Work Completed This Week
(Detailed bullet list of all work done)

### Milestone Tracker
| Milestone | Target Date | Status |
|-----------|-------------|--------|
(List 3-5 key milestones)

### Resource Utilisation
- **Average Daily Manpower:** (number by trade)
- **Equipment:** (key equipment and utilisation %)
- **Key Materials Used This Week:** (list)

### Budget Status
- **Planned Spend This Week:** ₹
- **Actual Spend This Week:** ₹
- **Cumulative Spend to Date:** ₹
- **Variance:** (% over or under)

### Risks & Issues
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
(List top 3 risks)

### Next Week Plan
(Bullet list of planned activities)

### Key Decisions Needed
(Any approvals or decisions required from client or management)

### Project Health (RAG)
- **Schedule:** 🟢 On Track / 🟡 At Risk / 🔴 Delayed
- **Budget:** 🟢 On Track / 🟡 At Risk / 🔴 Over
- **Quality:** 🟢 Good / 🟡 Minor Issues / 🔴 Action Required"""


def _mpr_prompt(project_name: str, today: str, ctx: str, extra: str) -> str:
    return f"""Generate a Monthly Progress Report (MPR) for this construction project.

**Project Details:**
{ctx}{extra}

Write the full report using this exact structure:

## Monthly Progress Report
**Reporting Month:** {today}
**Project:** {project_name}

### Executive Summary
(4-5 sentences covering overall status, major achievements, key challenges, and outlook)

### Progress Overview
- **Overall Project Completion:** X%
- **Planned Completion This Month:** X%
- **Actual Completion This Month:** X%
- **Schedule Variance:** (X days ahead / behind schedule)

### Key Achievements This Month
(Bullet list of major milestones achieved)

### Financial Summary
| Item | Planned (₹) | Actual (₹) | Variance (%) |
|------|-------------|------------|--------------|
| Monthly Budget | | | |
| Cumulative Budget | | | |
| Projected Final Cost | | | |

### Schedule Performance
(Paragraph on planned vs actual progress, critical path, and delay causes if any)

### Work Completed This Month
(Detailed list of all significant work completed)

### Upcoming Work — Next Month
(Bullet list of planned activities for next month)

### Risk Register
| Risk | Probability | Impact | Status | Mitigation |
|------|-------------|--------|--------|------------|
(List top 5 risks)

### Open Issues Requiring Action
(Numbered list of unresolved issues)

### Photographs & Documentation Produced
(List key documents, drawings, or inspection records produced)

### Recommendations to Management
(Bullet list of key recommendations)"""
