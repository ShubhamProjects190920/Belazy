"""
Application Configuration
All environment variables are read from the .env file.
pydantic-settings validates and type-checks every value automatically.
"""
import logging
from typing import List
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # ── Project Info ───────────────────────────────────
    PROJECT_NAME: str = "AI Project Controls Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # ── Security ───────────────────────────────────────
    # Default is fine for local development only — MUST be overridden in production
    SECRET_KEY: str = "dev-secret-key-change-this-in-production-do-not-use-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS: int = 48
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 24

    # ── Database ───────────────────────────────────────
    # Default matches the docker-compose.yml postgres service
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/ai_project_controls"

    # ── CORS ───────────────────────────────────────────
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # ── Email ──────────────────────────────────────────
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = ""
    EMAILS_FROM_NAME: str = "AI Project Controls"

    # ── Frontend URL (used in email links) ─────────────
    FRONTEND_URL: str = "http://localhost:5173"

    # ── AI / Anthropic ────────────────────────────────
    ANTHROPIC_API_KEY: str = ""

    # ── Stripe ─────────────────────────────────────────
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    # Price IDs from your Stripe Dashboard (Products → Prices)
    STRIPE_PRICE_PRO_MONTHLY: str = ""
    STRIPE_PRICE_ENTERPRISE_MONTHLY: str = ""

    model_config = {"env_file": ".env", "case_sensitive": True, "extra": "ignore"}


settings = Settings()

if settings.SECRET_KEY.startswith("dev-secret-key"):
    logger.warning("⚠️  Using default SECRET_KEY — set a real one in .env before going to production!")
