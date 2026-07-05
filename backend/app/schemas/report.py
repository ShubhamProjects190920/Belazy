from pydantic import BaseModel, EmailStr


class EmailReportRequest(BaseModel):
    to_email: EmailStr
