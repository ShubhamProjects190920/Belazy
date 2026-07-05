"""
Email Service — OTP & Invitation emails
"""
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from app.core.config import settings

logger = logging.getLogger(__name__)


# ── HTML Templates ────────────────────────────────────────────────────────────

def _build_otp_html(user_name: str, otp_code: str, action: str) -> str:
    digits = "".join(
        f'<span style="display:inline-block;width:44px;height:56px;line-height:56px;'
        f'text-align:center;font-size:28px;font-weight:700;color:#1e3a8a;'
        f'background:#eff6ff;border:2px solid #bfdbfe;border-radius:8px;margin:0 4px;">'
        f'{d}</span>'
        for d in otp_code
    )
    return f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
      <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.1);">
        <div style="background:#1e40af;padding:28px 32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:-0.3px;">AI Project Controls</h1>
        </div>
        <div style="padding:36px 32px;text-align:center;">
          <h2 style="color:#1e293b;margin:0 0 8px;">Your {action} Code</h2>
          <p style="color:#64748b;margin:0 0 28px;">Hi {user_name}, use this code to {action.lower()} to your account.</p>
          <div style="margin:0 auto 28px;">{digits}</div>
          <p style="color:#94a3b8;font-size:13px;margin:0;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
        <div style="background:#f8fafc;padding:16px;text-align:center;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">If you did not request this, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
    """


def _build_invitation_html(company_name: str, inviter_name: str, role: str, invite_url: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
      <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.1);">
        <div style="background:#1e40af;padding:28px 32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;">AI Project Controls</h1>
        </div>
        <div style="padding:36px 32px;">
          <h2 style="color:#1e293b;">You've been invited!</h2>
          <p style="color:#475569;"><strong>{inviter_name}</strong> has invited you to join <strong>{company_name}</strong> as a <strong>{role}</strong>.</p>
          <div style="text-align:center;margin:28px 0;">
            <a href="{invite_url}" style="background:#1e40af;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">Accept Invitation</a>
          </div>
          <p style="color:#94a3b8;font-size:13px;">This invitation expires in 7 days.</p>
        </div>
      </div>
    </body>
    </html>
    """


# ── Core Send Function ────────────────────────────────────────────────────────

async def _send_email(to_email: str, subject: str, html_body: str) -> bool:
    if not settings.SMTP_HOST or not settings.EMAILS_FROM_EMAIL:
        logger.warning(f"[EMAIL NOT SENT — No SMTP]\nTo: {to_email}\nSubject: {subject}")
        return True

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = to_email
    message.attach(MIMEText(html_body, "html"))

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


# ── Public Functions ──────────────────────────────────────────────────────────

async def send_otp_email(to_email: str, user_name: str, otp_code: str, is_new_user: bool) -> bool:
    action = "Sign Up" if is_new_user else "Sign In"
    html = _build_otp_html(user_name, otp_code, action)
    return await _send_email(to_email, f"Your AI Project Controls {action} Code: {otp_code}", html)


async def send_invitation_email(
    to_email: str, company_name: str, inviter_name: str, role: str, token: str
) -> bool:
    url = f"{settings.FRONTEND_URL}/accept-invite/{token}"
    html = _build_invitation_html(company_name, inviter_name, role, url)
    return await _send_email(to_email, f"You're invited to join {company_name}", html)
