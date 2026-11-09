"""Central settings, read from environment variables (.env supported)."""

from __future__ import annotations

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


def _list(name: str, default: str) -> list[str]:
    return [v.strip() for v in os.getenv(name, default).split(",") if v.strip()]


@dataclass(frozen=True)
class Settings:
    database_url: str = field(default_factory=lambda: os.getenv(
        "DATABASE_URL", "sqlite:///./smartcart.db"))
    allowed_origins: list[str] = field(default_factory=lambda: _list(
        "ALLOWED_ORIGINS", "http://localhost:3000"))
    currency: str = field(default_factory=lambda: os.getenv("CURRENCY", "INR"))
    free_shipping_threshold: float = field(default_factory=lambda: float(
        os.getenv("FREE_SHIPPING_THRESHOLD", "35")))
    flat_shipping_fee: float = field(default_factory=lambda: float(
        os.getenv("FLAT_SHIPPING_FEE", "5.99")))
    gemini_api_key: str | None = field(default_factory=lambda: os.getenv("GEMINI_API_KEY") or None)
    gemini_model: str = field(default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-1.5-flash"))
    openai_api_key: str | None = field(default_factory=lambda: os.getenv("OPENAI_API_KEY") or None)
    openai_model: str = field(default_factory=lambda: os.getenv("OPENAI_MODEL", "gpt-4o-mini"))
    paypal_env: str = field(default_factory=lambda: os.getenv("PAYPAL_ENV", "sandbox"))
    paypal_client_id: str | None = field(default_factory=lambda: os.getenv("PAYPAL_CLIENT_ID") or None)
    paypal_client_secret: str | None = field(default_factory=lambda: os.getenv("PAYPAL_CLIENT_SECRET") or None)
    paypal_webhook_id: str | None = field(default_factory=lambda: os.getenv("PAYPAL_WEBHOOK_ID") or None)
    serpapi_api_key: str | None = field(default_factory=lambda: os.getenv("SERPAPI_API_KEY") or None)


settings = Settings()
