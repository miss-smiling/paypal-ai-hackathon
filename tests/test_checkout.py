import uuid

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def _session() -> str:
    return f"sess-{uuid.uuid4().hex[:12]}"


def _order(client, session_id, product_id="vn-gan65", approved=True, key=None, coupon=None):
    return client.post(
        "/api/checkout/create-order",
        headers={"Idempotency-Key": key or f"key-{uuid.uuid4().hex}"},
        json={"session_id": session_id, "product_id": product_id,
              "approved": approved, "coupon_code": coupon},
    )


def test_payment_requires_explicit_approval(client):
    res = _order(client, _session(), approved=False)
    assert res.status_code == 403
    assert "not approved" in str(res.json()["detail"]["reasons"])


def test_idempotency_key_returns_same_order(client):
    sid = _session()
    key = f"idem-{uuid.uuid4().hex}"
    first = _order(client, sid, key=key)
    second = _order(client, sid, key=key)
    assert first.status_code == 201
    assert second.json()["id"] == first.json()["id"]
    assert second.json()["replayed"] is True


def test_velocity_check_blocks_fourth_rapid_order(client):
    sid = _session()
    for _ in range(3):
        assert _order(client, sid).status_code == 201
    res = _order(client, sid)
    assert res.status_code == 403
    assert any("velocity" in r for r in res.json()["detail"]["reasons"])


def test_capture_completes_order_and_insights_update(client):
    sid = _session()
    order = _order(client, sid, product_id="aq-pro").json()
    captured = client.post("/api/checkout/capture", json={"order_id": order["id"]})
    assert captured.status_code == 200
    assert captured.json()["status"] == "COMPLETED"

    insights = client.get(f"/api/sessions/{sid}/insights").json()
    assert insights["orders_completed"] == 1
    assert insights["spend_by_category"]["headphones"] > 0


def test_unknown_product_is_404(client):
    res = _order(client, _session(), product_id="does-not-exist")
    assert res.status_code == 404


def test_orders_listing(client):
    sid = _session()
    _order(client, sid, product_id="kb-basic")
    orders = client.get(f"/api/sessions/{sid}/orders").json()
    assert len(orders) == 1
    assert orders[0]["product_id"] == "kb-basic"


def test_webhook_rejected_without_verification_config(client):
    res = client.post("/api/webhooks/paypal", json={"event_type": "PAYMENT.CAPTURE.COMPLETED"})
    assert res.status_code == 401
