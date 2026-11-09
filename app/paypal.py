"""PayPal REST API (Orders v2) client. Sandbox by default.

If PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET are not set, checkout runs in
mock mode so the whole flow can be demonstrated without credentials.
"""

from __future__ import annotations

import uuid

import httpx

from app.config import settings

BASES = {
    "sandbox": "https://api-m.sandbox.paypal.com",
    "live": "https://api-m.paypal.com",
}


def is_configured() -> bool:
    return bool(settings.paypal_client_id and settings.paypal_client_secret)


def _base() -> str:
    return BASES.get(settings.paypal_env, BASES["sandbox"])


async def _access_token(client: httpx.AsyncClient) -> str:
    resp = await client.post(
        f"{_base()}/v1/oauth2/token",
        data={"grant_type": "client_credentials"},
        auth=(settings.paypal_client_id, settings.paypal_client_secret),
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def _headers(token: str, request_id: str) -> dict:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json",
            "PayPal-Request-Id": request_id}


async def create_order(total: float, currency: str, reference: str, request_id: str) -> dict:
    """request_id makes the call idempotent on PayPal's side as well as ours."""
    if not is_configured():
        return {"id": f"MOCK-{uuid.uuid4().hex[:10].upper()}", "status": "CREATED",
                "mock": True, "approve_url": None}

    async with httpx.AsyncClient(timeout=20) as client:
        token = await _access_token(client)
        resp = await client.post(
            f"{_base()}/v2/checkout/orders",
            headers=_headers(token, request_id),
            json={"intent": "CAPTURE", "purchase_units": [{
                "reference_id": reference,
                "amount": {"currency_code": currency, "value": f"{total:.2f}"},
            }]},
        )
        resp.raise_for_status()
        data = resp.json()

    approve = next((l["href"] for l in data.get("links", []) if l.get("rel") == "payer-action"), None)
    return {"id": data["id"], "status": data["status"], "mock": False, "approve_url": approve}


async def capture_order(order_id: str, request_id: str) -> dict:
    if not is_configured() or order_id.startswith("MOCK-"):
        return {"id": order_id, "status": "COMPLETED", "mock": True}

    async with httpx.AsyncClient(timeout=20) as client:
        token = await _access_token(client)
        resp = await client.post(
            f"{_base()}/v2/checkout/orders/{order_id}/capture",
            headers=_headers(token, request_id),
        )
        resp.raise_for_status()
        data = resp.json()
    return {"id": data["id"], "status": data["status"], "mock": False}


async def verify_webhook(headers: dict, event: dict) -> bool:
    """Ask PayPal to verify the webhook signature. Needs PAYPAL_WEBHOOK_ID."""
    if not (is_configured() and settings.paypal_webhook_id):
        return False
    payload = {
        "auth_algo": headers.get("paypal-auth-algo"),
        "cert_url": headers.get("paypal-cert-url"),
        "transmission_id": headers.get("paypal-transmission-id"),
        "transmission_sig": headers.get("paypal-transmission-sig"),
        "transmission_time": headers.get("paypal-transmission-time"),
        "webhook_id": settings.paypal_webhook_id,
        "webhook_event": event,
    }
    async with httpx.AsyncClient(timeout=20) as client:
        token = await _access_token(client)
        resp = await client.post(
            f"{_base()}/v1/notifications/verify-webhook-signature",
            headers={"Authorization": f"Bearer {token}"},
            json=payload,
        )
        resp.raise_for_status()
    return resp.json().get("verification_status") == "SUCCESS"
