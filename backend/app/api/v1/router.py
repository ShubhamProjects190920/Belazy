"""
API v1 Router
Combines all endpoint routers under /api/v1.
As we build more modules, we add their routers here.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import ai, auth, billing, company, dashboard, project, report

api_router = APIRouter()

# Module 1 — Authentication
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Module 2 — Company & Team
api_router.include_router(company.router, prefix="/company", tags=["Company"])

# Module 3 — Subscription & Billing
api_router.include_router(billing.router, prefix="/billing", tags=["Billing"])

# Module 4 — Project Management
api_router.include_router(project.router, prefix="/projects", tags=["Projects"])

# Module 6 — Dashboard & KPIs
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])

# Module 7 — AI Features
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])

# Module 8 — Reports
api_router.include_router(report.router, prefix="/reports", tags=["Reports"])
