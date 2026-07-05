from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ReportGenerateRequest(BaseModel):
    project_id: UUID
    report_type: str  # daily | weekly | monthly
    extra_context: Optional[str] = None


class AIReportResponse(BaseModel):
    id: UUID
    company_id: UUID
    project_id: Optional[UUID]
    report_type: str
    title: str
    content: str
    tokens_used: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatMessage(BaseModel):
    role: str  # user | assistant
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class ChatResponse(BaseModel):
    message: str
    input_tokens: int
    output_tokens: int
