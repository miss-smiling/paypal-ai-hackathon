from fastapi.testclient import TestClient

from app.assistant import route
from app.main import app

SID = "assistant-test-session"


def chat(client, message, **extra):
    return client.post("/api/assistant/chat",
                       json={"session_id": SID, "message": message, **extra})


def test_route_splits_shopping_from_support():
    assert route("ANC headphones under 250 with 30h battery") == "shop"
    assert route("where is my order?") == "support"
    assert route("why was my payment blocked") == "support"


def test_shop_message_runs_pipeline():
    with TestClient(app) as client:
        r = chat(client, "ANC headphones under 250 with 30h battery")
        assert r.status_code == 200
        body = r.json()
        assert body["mode"] == "shop"
        assert body["search"]["top_pick"]
        assert "Top pick" in body["reply"]


def test_support_with_no_orders():
    with TestClient(app) as client:
        body = chat(client, "where is my order?").json()
        assert body["mode"] == "support"
        assert body["orders"] == []
        assert "no orders" in body["reply"].lower()


def test_support_sees_blocked_order_scope_and_refund_honesty():
    with TestClient(app) as client:
        # an unapproved payment is blocked and creates no order
        blocked = client.post("/api/checkout/create-order",
                              headers={"Idempotency-Key": "assistant-key-0001"},
                              json={"session_id": SID, "product_id": "vn-gan30", "approved": False})
        assert blocked.status_code == 403

        ok = client.post("/api/checkout/create-order",
                         headers={"Idempotency-Key": "assistant-key-0002"},
                         json={"session_id": SID, "product_id": "vn-gan30", "approved": True})
        assert ok.status_code == 201
        order_id = ok.json()["id"]

        body = chat(client, f"status of order {order_id}").json()
        assert body["mode"] == "support"
        assert [o["id"] for o in body["orders"]] == [order_id]

        # another session cannot look this order up
        other = client.post("/api/assistant/chat",
                            json={"session_id": "someone-else-123", "message": f"status of order {order_id}"}).json()
        assert other["orders"] == []

        refund = chat(client, "I want a refund").json()
        assert "can't process refunds" in refund["reply"]


def test_validation():
    with TestClient(app) as client:
        assert client.post("/api/assistant/chat",
                           json={"session_id": "short", "message": "hi"}).status_code == 422
