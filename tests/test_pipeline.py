import asyncio

import pytest
from fastapi.testclient import TestClient

from app.agents import analyze_reviews, best_coupon
from app.cart import build_ledger
from app.intent import rule_parse
from app.main import app
from app.graph import run_pipeline


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_rule_parse_extracts_budget_and_specs():
    intent = rule_parse("Find 65W GaN travel charger under $40")
    assert intent["category"] == "charger"
    assert intent["max_price"] == 40
    assert intent["attributes"]["min_watts"] == 65
    assert intent["attributes"]["gan"] is True


def test_rule_parse_headphones_battery():
    intent = rule_parse("ANC headphones under $250 with 30h battery")
    assert intent["category"] == "headphones"
    assert intent["max_price"] == 250
    assert intent["attributes"]["anc"] is True
    assert intent["attributes"]["min_battery_h"] == 30


def test_graph_respects_budget_and_runs_all_agents():
    result = asyncio.run(run_pipeline("Find 65W GaN travel charger under $40"))
    assert result["top_pick"] is not None
    assert result["cart"]["items"][0]["price"] <= 40
    assert all(row["product"]["price"] <= 40 for row in result["matrix"])
    trace = " | ".join(result["trace"])
    for agent in ("Intent", "Discovery", "Review", "Budget", "Optimizer", "Price"):
        assert agent in trace


def test_graph_no_match_returns_message():
    result = asyncio.run(run_pipeline("keyboard under $5"))
    assert result["top_pick"] is None
    assert "No products match" in result["message"]


def test_budget_agent_suggests_cheaper_alternatives():
    result = asyncio.run(run_pipeline(
        "ANC headphones under $250 with 30h battery", session_budget=50.0, spent_so_far=0.0))
    assert result["budget"]["remaining"] == 50.0
    assert result["alternatives"], "expected a cheaper option under the remaining budget"
    assert all(a["product"]["price"] <= 50 for a in result["alternatives"])


def test_suspicious_reviews_are_flagged():
    result = analyze_reviews("vn-gan65")
    assert result["flagged"] == 2
    assert result["trust_score"] < 100


def test_coupon_applies_to_headphones_over_100():
    coupon = best_coupon(199.0, "headphones")
    assert coupon["code"] == "FLYTECH25"
    assert coupon["saving"] == 25.0


def test_coupon_not_applied_below_minimum():
    assert best_coupon(20.0, "charger") is None  # CHARGE5 needs $25+


def test_free_shipping_over_threshold():
    product = {"id": "x", "name": "X", "price": 60.0, "category": "keyboard"}
    assert build_ledger([product])["shipping"] == 0.0


def test_search_endpoint_persists_run(client):
    res = client.post("/api/search", json={
        "session_id": "test-session-search-1",
        "query": "ANC headphones under $250 with 30h battery",
    })
    assert res.status_code == 200
    body = res.json()
    assert body["top_pick"]
    assert body["cart"]["total"] > 0


def test_health_reports_paypal_mode(client):
    body = client.get("/api/health").json()
    assert body["paypal_configured"] is False
    assert body["status"] == "ok"


def test_budget_endpoint(client):
    res = client.put("/api/sessions/test-session-budget-1/budget", json={"budget": 120})
    assert res.json()["budget"] == 120
