"""Comprehensive tests for SmartCart AI new features:
1. Phone OTP Verification & One verified phone number = One account constraint
2. Google Sign-In with mandatory phone verification
3. Genuine User Rating & Live Footer Stats
4. Public Community Chat, link sharing, image restrictions & @Cart invocation
5. Nearby Offline Store Discovery
"""
import pytest
from fastapi.testclient import TestClient

from app.auth_utils import create_jwt_token, normalize_phone
from app.db import CommunityMessage, SessionLocal, User, UserRating, init_db
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    init_db()


def test_phone_normalization():
    assert normalize_phone("9876543210") == "+919876543210"
    assert normalize_phone("+91 98765-43210") == "+919876543210"
    assert normalize_phone("+1 415 555 2671") == "+14155552671"


def test_otp_flow_and_registration():
    # 1. Send OTP
    phone = "+919111222333"
    res = client.post("/api/auth/otp/send", json={"phone_number": phone})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "sent"
    otp = data["demo_otp"]
    assert len(otp) == 6

    # 2. Register new user
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": "testuser_otp@smartcart.ai",
            "full_name": "Test OTP User",
            "phone_number": phone,
            "otp": otp,
            "password": "Password123!",
        },
    )
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "token" in reg_data
    assert reg_data["user"]["phone_number"] == phone

    # 3. CRITICAL RULE TEST: Attempt duplicate registration with the same phone number
    dup_res = client.post(
        "/api/auth/register",
        json={
            "email": "different_email@smartcart.ai",
            "full_name": "Duplicate Phone Attempter",
            "phone_number": phone,
            "otp": otp,
            "password": "Password123!",
        },
    )
    assert dup_res.status_code == 409
    assert "already associated" in dup_res.json()["detail"]


def test_google_auth_requires_phone_verification():
    # 1. Brand new Google account with no phone -> requires verification
    res = client.post(
        "/api/auth/google",
        json={
            "google_id": "google-new-id-999",
            "email": "newgoogleuser@example.com",
            "full_name": "New Google User",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "phone_verification_required"

    # 2. Supply phone and OTP
    phone = "+919222333444"
    otp_res = client.post("/api/auth/otp/send", json={"phone_number": phone})
    otp = otp_res.json()["demo_otp"]

    auth_res = client.post(
        "/api/auth/google",
        json={
            "google_id": "google-new-id-999",
            "email": "newgoogleuser@example.com",
            "full_name": "New Google User",
            "phone_number": phone,
            "otp": otp,
        },
    )
    assert auth_res.status_code == 200
    auth_data = auth_res.json()
    assert auth_data["status"] == "authenticated"
    assert auth_data["user"]["phone_number"] == phone


def test_genuine_ratings_and_footer_stats():
    # 1. Check footer stats
    stats_res = client.get("/api/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "registered_users" in stats
    assert "average_rating" in stats
    assert stats["registered_users"] >= 2  # seeded accounts
    assert stats["average_rating"] > 0

    # 2. Submit rating as authenticated user
    with SessionLocal() as db:
        user = db.query(User).filter_by(email="sujit.krishna@smartcart.ai").first()
        token = create_jwt_token({"sub": user.id, "email": user.email, "role": user.role})

    rate_res = client.post(
        "/api/ratings",
        json={"rating": 5, "comment": "Outstanding AI comparison engine!"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert rate_res.status_code == 200
    rate_data = rate_res.json()
    assert rate_data["status"] == "success"
    assert rate_data["rating"]["rating"] == 5


def test_community_messages_and_cart_mention():
    # 0. Test demo token endpoint and posting with demo-token
    demo_res = client.get("/api/auth/demo-token")
    assert demo_res.status_code == 200
    demo_jwt = demo_res.json()["token"]
    assert len(demo_jwt.split(".")) == 3

    # Post using demo-token header alias
    demo_post_res = client.post(
        "/api/community/messages",
        json={"content": "Testing community message with demo-token alias"},
        headers={"Authorization": "Bearer demo-token"},
    )
    assert demo_post_res.status_code == 200
    assert demo_post_res.json()["message"]["content"] == "Testing community message with demo-token alias"

    with SessionLocal() as db:
        user = db.query(User).filter_by(email="sujit.krishna@smartcart.ai").first()
        token = create_jwt_token({"sub": user.id, "email": user.email, "role": user.role, "name": user.full_name})

    # 1. Post a normal message
    msg_res = client.post(
        "/api/community/messages",
        json={"content": "Anyone tried the Lenovo Slim 3 vs HP Pavilion 14 for coding?"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert msg_res.status_code == 200
    msg_data = msg_res.json()
    assert msg_data["message"]["content"] == "Anyone tried the Lenovo Slim 3 vs HP Pavilion 14 for coding?"
    assert msg_data["bot_reply"] is None

    # 2. Post a message mentioning @Cart
    cart_mention_res = client.post(
        "/api/community/messages",
        json={"content": "@Cart which one has better battery life under ₹70,000?"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert cart_mention_res.status_code == 200
    cart_data = cart_mention_res.json()
    assert cart_data["bot_reply"] is not None
    assert cart_data["bot_reply"]["is_bot"] is True
    assert "Cart" in cart_data["bot_reply"]["user_name"]


def test_nearby_store_discovery():
    res = client.get("/api/stores/search?query=Bangalore&category=Electronics&radius_km=10")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["total_stores"] > 0
    first_store = data["stores"][0]
    assert "name" in first_store
    assert "distance_km" in first_store
    assert "address" in first_store
    assert first_store["live_inventory"] is False  # Never fabricate inventory
    assert "directions_url" in first_store
