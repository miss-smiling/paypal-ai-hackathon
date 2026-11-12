"""Authentication and security utilities for SmartCart AI.
Self-contained cryptographic helpers for password hashing, JWT generation/validation,
phone normalization, and secure OTP verification using Python standard library.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from app.config import settings

# Use settings.secret_key or a secure fallback
SECRET_KEY = getattr(settings, "secret_key", "smartcart-secure-jwt-secret-key-2026")


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _b64url_decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding != 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data)


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"{salt}${dk.hex()}"


def verify_password(plain: str, hashed: str) -> bool:
    if not hashed or "$" not in hashed:
        return False
    try:
        salt, expected_hex = hashed.split("$", 1)
        dk = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt.encode("utf-8"), 100_000)
        return hmac.compare_digest(dk.hex(), expected_hex)
    except Exception:
        return False


def normalize_phone(phone: str) -> str:
    """Normalize phone numbers to international standard format (E.164-like).
    Handles Indian numbers (default +91 if 10 digits) and international numbers starting with +.
    """
    cleaned = re.sub(r"[^\d+]", "", phone.strip())
    if not cleaned:
        raise ValueError("Invalid phone number: empty")
    if cleaned.startswith("+"):
        digits_only = re.sub(r"\D", "", cleaned)
        if len(digits_only) < 8 or len(digits_only) > 15:
            raise ValueError("Phone number must have between 8 and 15 digits")
        return cleaned
    # If standard 10 digits, default to +91 (India)
    digits_only = re.sub(r"\D", "", cleaned)
    if len(digits_only) == 10:
        return f"+91{digits_only}"
    if len(digits_only) == 11 and digits_only.startswith("0"):
        return f"+91{digits_only[1:]}"
    if len(digits_only) == 12 and digits_only.startswith("91"):
        return f"+{digits_only}"
    if 8 <= len(digits_only) <= 15:
        return f"+{digits_only}"
    raise ValueError("Invalid phone number format")


def generate_otp() -> str:
    """Generate a secure 6-digit numeric OTP."""
    return f"{secrets.randbelow(900000) + 100000}"


def hash_otp(phone: str, otp: str) -> str:
    """Hash OTP combined with phone and secret key so raw OTP is never stored in DB."""
    combined = f"{phone}:{otp}:{SECRET_KEY}"
    return hashlib.sha256(combined.encode("utf-8")).hexdigest()


def create_jwt_token(payload: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    body = payload.copy()
    now = datetime.now(timezone.utc)
    if expires_delta is None:
        expires_delta = timedelta(days=30)
    body["iat"] = int(now.timestamp())
    body["exp"] = int((now + expires_delta).timestamp())

    header_enc = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_enc = _b64url_encode(json.dumps(body, separators=(",", ":")).encode("utf-8"))
    msg = f"{header_enc}.{payload_enc}".encode("utf-8")
    sig = hmac.new(SECRET_KEY.encode("utf-8"), msg, hashlib.sha256).digest()
    sig_enc = _b64url_encode(sig)

    return f"{header_enc}.{payload_enc}.{sig_enc}"


def decode_jwt_token(token: str) -> dict[str, Any]:
    cleaned = token.strip().strip("\"'")
    parts = cleaned.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid token format")
    header_enc, payload_enc, sig_enc = parts
    msg = f"{header_enc}.{payload_enc}".encode("utf-8")
    expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), msg, hashlib.sha256).digest()
    actual_sig = _b64url_decode(sig_enc)

    if not hmac.compare_digest(expected_sig, actual_sig):
        raise ValueError("Invalid token signature")

    payload = json.loads(_b64url_decode(payload_enc).decode("utf-8"))
    exp = payload.get("exp")
    # Allow 300 seconds (5 min) leeway for client clock skew
    if exp and (datetime.now(timezone.utc).timestamp() - 300) > exp:
        raise ValueError("Token has expired")
    return payload
