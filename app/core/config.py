"""Central settings — read from environment / .env file."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import List

from dotenv import load_dotenv

load_dotenv()


def _list(name: str, default: str) -> list[str]:
    return [v.strip() for v in os.getenv(name, default).split(",") if v.strip()]


@dataclass(frozen=True)
class Settings:
    # ── Database ────────────────────────────────────────────────────────────
    database_url: str = field(default_factory=lambda: os.getenv(
        "DATABASE_URL", "sqlite:///./smartkart.db"))

    # ── CORS ────────────────────────────────────────────────────────────────
    allowed_origins: list[str] = field(default_factory=lambda: _list(
        "ALLOWED_ORIGINS", "http://localhost:3000"))

    # ── JWT / Auth ───────────────────────────────────────────────────────────
    secret_key: str = field(default_factory=lambda: os.getenv(
        "SECRET_KEY", "CHANGE_ME_IN_PRODUCTION_USE_32_BYTES_MINIMUM"))
    algorithm: str = field(default_factory=lambda: os.getenv("JWT_ALGORITHM", "HS256"))
    access_token_expire_minutes: int = field(default_factory=lambda: int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")))
    refresh_token_expire_days: int = field(default_factory=lambda: int(
        os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7")))

    # ── Currency & pricing ───────────────────────────────────────────────────
    currency: str = field(default_factory=lambda: os.getenv("CURRENCY", "INR"))
    free_shipping_threshold: float = field(default_factory=lambda: float(
        os.getenv("FREE_SHIPPING_THRESHOLD", "500")))
    flat_shipping_fee: float = field(default_factory=lambda: float(
        os.getenv("FLAT_SHIPPING_FEE", "49")))
    single_order_limit: float = field(default_factory=lambda: float(
        os.getenv("SINGLE_ORDER_LIMIT", "500000")))

    # ── LLM ─────────────────────────────────────────────────────────────────
    gemini_api_key: str | None = field(default_factory=lambda: os.getenv("GEMINI_API_KEY") or None)
    gemini_model: str = field(default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-1.5-flash"))
    openai_api_key: str | None = field(default_factory=lambda: os.getenv("OPENAI_API_KEY") or None)
    openai_model: str = field(default_factory=lambda: os.getenv("OPENAI_MODEL", "gpt-4o-mini"))

    # ── PayPal ───────────────────────────────────────────────────────────────
    paypal_env: str = field(default_factory=lambda: os.getenv("PAYPAL_ENV", "sandbox"))
    paypal_client_id: str | None = field(default_factory=lambda: os.getenv("PAYPAL_CLIENT_ID") or None)
    paypal_client_secret: str | None = field(default_factory=lambda: os.getenv("PAYPAL_CLIENT_SECRET") or None)
    paypal_webhook_id: str | None = field(default_factory=lambda: os.getenv("PAYPAL_WEBHOOK_ID") or None)

    # ── Admin ────────────────────────────────────────────────────────────────
    admin_email: str = field(default_factory=lambda: os.getenv("ADMIN_EMAIL", "admin@smartkart.in"))
    admin_password: str = field(default_factory=lambda: os.getenv("ADMIN_PASSWORD", "Admin@123"))


settings = Settings()
