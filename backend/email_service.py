"""Email service — Resend integration for transactional emails (OTP, booking confirmations)."""
import os
import asyncio
import logging

import resend

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
SEND_EMAILS = os.environ.get("SEND_EMAILS", "false").lower() == "true"

if RESEND_API_KEY and RESEND_API_KEY != "placeholder_resend_key":
    resend.api_key = RESEND_API_KEY


def _otp_template(otp_code: str, nome: str = "") -> str:
    saluto = f"Ciao {nome}" if nome else "Ciao"
    return f"""<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><title>Verifica email - FunzionaBene</title></head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#F4F1ED;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0A0A0A;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="520" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background-color:#111111;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
        <tr><td style="padding:40px 40px 20px 40px;text-align:center;">
          <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#D4A017 0%,#6B8FA3 100%);line-height:56px;color:#111111;font-weight:bold;font-size:18px;">FB</div>
          <div style="margin-top:16px;font-family:Georgia,serif;font-size:22px;color:#F4F1ED;letter-spacing:-0.3px;">funzionabene</div>
          <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#6B8FA3;margin-top:4px;">clinica psicologica</div>
        </td></tr>
        <tr><td style="padding:20px 40px 0 40px;">
          <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:500;color:#F4F1ED;margin:0 0 16px 0;line-height:1.3;">Verifica la tua email</h1>
          <p style="color:rgba(230,226,216,0.7);font-size:15px;line-height:1.6;margin:0 0 24px 0;">
            {saluto}, grazie per esserti registrato su <strong style="color:#F4F1ED;">funzionabene.it</strong>.<br>
            Inserisci questo codice nella pagina di verifica per completare la registrazione:
          </p>
        </td></tr>
        <tr><td style="padding:0 40px;">
          <div style="background-color:rgba(212,160,23,0.08);border:1px solid rgba(212,160,23,0.3);border-radius:14px;padding:24px;text-align:center;">
            <div style="font-family:'Courier New',monospace;font-size:36px;font-weight:bold;letter-spacing:12px;color:#D4A017;">{otp_code}</div>
            <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(230,226,216,0.5);margin-top:10px;">Codice valido per 10 minuti</div>
          </div>
        </td></tr>
        <tr><td style="padding:32px 40px 20px 40px;">
          <p style="color:rgba(230,226,216,0.5);font-size:13px;line-height:1.6;margin:0;">
            Se non hai richiesto questa email, puoi ignorarla. Il codice scadrà automaticamente.
          </p>
        </td></tr>
        <tr><td style="padding:20px 40px 40px 40px;border-top:1px solid rgba(255,255,255,0.08);">
          <p style="color:rgba(230,226,216,0.4);font-size:11px;line-height:1.6;margin:0;text-align:center;">
            © FunzionaBene — Clinica di Psicologia e Sessuologia<br>
            Trattamento dati ai sensi del GDPR (Reg. UE 2016/679)
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>"""


async def send_otp_email(email: str, otp_code: str, nome: str = "") -> bool:
    """Send OTP verification email. Returns True on success, False on failure.
    Does not raise — caller should continue even if email fails (dev mode fallback)."""
    if not SEND_EMAILS:
        logger.info(f"[EMAIL DISABLED] OTP for {email}: {otp_code}")
        return False
    if not RESEND_API_KEY or RESEND_API_KEY == "placeholder_resend_key":
        logger.warning(f"[EMAIL] No Resend API key configured, skipping send to {email}")
        return False

    params = {
        "from": f"FunzionaBene <{SENDER_EMAIL}>",
        "to": [email],
        "subject": f"Il tuo codice di verifica: {otp_code}",
        "html": _otp_template(otp_code, nome),
    }
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"[EMAIL SENT] OTP to {email} (id={result.get('id') if isinstance(result, dict) else result})")
        return True
    except Exception as e:
        logger.error(f"[EMAIL ERROR] Failed to send OTP to {email}: {e}")
        return False
