"""Skebby SMS service — login + send OTP SMS. https://api.skebby.it"""
import os
import asyncio
import logging
from typing import Optional, Tuple

import httpx

logger = logging.getLogger(__name__)

SKEBBY_BASE = "https://api.skebby.it/API/v1.0/REST/"
USERNAME = os.environ.get("SKEBBY_USERNAME", "")
PASSWORD = os.environ.get("SKEBBY_PASSWORD", "")
SENDER = os.environ.get("SKEBBY_SENDER", "FunzioBene")[:11]  # max 11 chars alfanumerici
SMS_TYPE = os.environ.get("SKEBBY_SMS_TYPE", "GP")  # GP=classic+, TI=basic, SI=high-quality

# In-memory session cache
_session: dict = {"user_key": None, "session_key": None, "ttl": 0}


async def _login() -> Tuple[Optional[str], Optional[str]]:
    """Authenticate with Skebby, returns (user_key, session_key)."""
    if not USERNAME or not PASSWORD:
        logger.warning("[SKEBBY] credentials missing")
        return None, None
    try:
        async with httpx.AsyncClient(timeout=15.0) as c:
            r = await c.get(f"{SKEBBY_BASE}login", params={"username": USERNAME, "password": PASSWORD})
        if r.status_code != 200:
            logger.error(f"[SKEBBY] login failed {r.status_code}: {r.text}")
            return None, None
        parts = r.text.strip().split(";")
        if len(parts) != 2:
            logger.error(f"[SKEBBY] unexpected login response: {r.text}")
            return None, None
        return parts[0], parts[1]
    except Exception as e:
        logger.error(f"[SKEBBY] login exception: {e}")
        return None, None


async def _ensure_session() -> Optional[dict]:
    """Ensure we have a valid session_key. Simple cache (Skebby sessions last ~5 hours)."""
    import time
    now = time.time()
    if _session["user_key"] and _session["ttl"] > now:
        return {"user_key": _session["user_key"], "session_key": _session["session_key"]}
    user_key, session_key = await _login()
    if not user_key:
        return None
    _session["user_key"] = user_key
    _session["session_key"] = session_key
    _session["ttl"] = now + 3600  # 1h cache
    return {"user_key": user_key, "session_key": session_key}


def _normalize_phone(phone: str) -> str:
    """Normalize IT phone numbers. Skebby wants E.164 without + (e.g. 393471234567)."""
    p = "".join(c for c in phone if c.isdigit() or c == "+")
    if p.startswith("+"):
        p = p[1:]
    elif p.startswith("00"):
        p = p[2:]
    elif p.startswith("3"):  # Italian mobile 3xx...
        p = "39" + p
    return p


async def send_sms_otp(phone: str, otp_code: str, context: str = "verifica") -> bool:
    """Send SMS OTP to a phone. Returns True on success."""
    sess = await _ensure_session()
    if not sess:
        logger.info(f"[SKEBBY DISABLED] OTP for {phone}: {otp_code}")
        return False
    to = _normalize_phone(phone)
    if not to.startswith("39") or len(to) < 10:
        logger.error(f"[SKEBBY] invalid phone: {phone} → {to}")
        return False
    text = f"FunzionaBene — il tuo codice di {context}: {otp_code}. Valido 10 minuti. Non condividerlo."
    payload = {
        "message_type": SMS_TYPE,
        "message": text,
        "recipient": [f"+{to}"],
        "sender": SENDER,
    }
    headers = {
        "user_key": sess["user_key"],
        "Session_key": sess["session_key"],
        "Content-Type": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as c:
            r = await c.post(f"{SKEBBY_BASE}sms", headers=headers, json=payload)
        if r.status_code in (200, 201):
            logger.info(f"[SKEBBY SENT] OTP to {to}: {r.text[:200]}")
            return True
        # Session might be expired → retry once with fresh login
        if r.status_code in (401, 403):
            _session["ttl"] = 0
            logger.info("[SKEBBY] session expired, retrying")
            return await send_sms_otp(phone, otp_code, context) if _session["ttl"] == 0 else False
        logger.error(f"[SKEBBY] send failed {r.status_code}: {r.text}")
        return False
    except Exception as e:
        logger.error(f"[SKEBBY] send exception: {e}")
        return False
