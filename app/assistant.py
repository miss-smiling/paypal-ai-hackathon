"""Conversational assistant: one entry point for shopping help and order/checkout support.

    chat() -> route(message) -> "shop"    -> LangGraph pipeline (run_pipeline), reply built from its result
                             -> "support" -> answer grounded in this session's orders and the store rules

Answers are grounded in data from the database and the pipeline. If GEMINI_API_KEY or
OPENAI_API_KEY is set, the LLM only rewords those facts. Without a key, or if the call
fails, a rule-based reply is used, so the demo always works.
"""

from __future__ import annotations

import re

import httpx
from sqlalchemy.orm import Session

from app import services
from app.catalog import COUPONS
from app.config import settings
from app.graph import run_pipeline

SUPPORT_WORDS = (
    "order", "refund", "payment", "paypal", "checkout", "charged", "charge me", "track",
    "status", "coupon", "promo", "discount code", "shipping", "delivery", "idempotent",
    "blocked", "declined", "failed", "cancel", "return", "receipt", "invoice", "twice",
    "duplicate", "budget used", "how much have i spent", "spent so far",
)

SYSTEM_PROMPT = (
    "You are the SmartCart support assistant. Answer using ONLY the facts provided. "
    "If the facts do not cover the question, say you do not have that information and "
    "suggest contacting the store. Never promise refunds, cancellations or delivery dates. "
    "Keep it under 90 words, plain text, no markdown."
)


def route(message: str) -> str:
    """Return 'support' for order/payment questions, otherwise 'shop'."""
    q = message.lower()
    return "support" if any(w in q for w in SUPPORT_WORDS) else "shop"


# ---------- LLM helper (optional) ----------

async def _llm(system: str, user: str) -> tuple[str, str] | None:
    """Return (text, provider) or None when no key is set or the call fails."""
    try:
        if settings.gemini_api_key:
            url = ("https://generativelanguage.googleapis.com/v1beta/models/"
                   f"{settings.gemini_model}:generateContent")
            body = {
                "systemInstruction": {"parts": [{"text": system}]},
                "contents": [{"parts": [{"text": user}]}],
                "generationConfig": {"temperature": 0.2},
            }
            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.post(url, json=body,
                                         headers={"x-goog-api-key": settings.gemini_api_key})
                resp.raise_for_status()
                text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
            return text.strip(), "gemini"
        if settings.openai_api_key:
            body = {
                "model": settings.openai_model,
                "temperature": 0.2,
                "messages": [{"role": "system", "content": system},
                             {"role": "user", "content": user}],
            }
            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions", json=body,
                    headers={"Authorization": f"Bearer {settings.openai_api_key}"})
                resp.raise_for_status()
                text = resp.json()["choices"][0]["message"]["content"]
            return text.strip(), "openai"
    except Exception:
        return None
    return None


# ---------- Support ----------

def _money(amount: float, currency: str) -> str:
    return f"{currency} {amount:,.2f}"


def _order_line(o: dict) -> str:
    mode = " (mock payment)" if o["mock"] else ""
    return (f"Order {o['id']}: {o['product_name']}, {_money(o['total'], o['currency'])}, "
            f"status {o['status']}{mode}, risk check {o['risk_level']}")


def _store_rules() -> list[str]:
    coupons = "; ".join(f"{code}: {c['description']}" for code, c in COUPONS.items())
    return [
        f"Shipping is free from {settings.free_shipping_threshold:g} after discounts, "
        f"otherwise a flat {settings.flat_shipping_fee:g} {settings.currency}.",
        f"Valid coupons: {coupons}.",
        "Payments need explicit shopper approval before PayPal is called.",
        "Each checkout request carries an idempotency key, so a retry or double click returns "
        "the same order and never charges twice.",
        "A payment is blocked when the shopper did not approve it or when 3 or more orders "
        "were placed in 10 minutes. It is sent for review when it is above the single-order "
        "limit of 500, above twice the session budget, or uses an unknown coupon.",
        "Refunds, cancellations and returns are not handled in this demo.",
    ]


def _find_order(message: str, orders: list[dict]) -> dict | None:
    """Match an order id mentioned in the message. Only this session's orders are searched."""
    low = message.lower()
    for o in orders:
        if o["id"].lower() in low:
            return o
    return None


def _support_facts(db: Session, session_id: str, message: str) -> tuple[list[str], list[dict]]:
    orders = services.orders_for_session(db, session_id)
    facts: list[str] = []
    mentioned = _find_order(message, orders)
    shown = [mentioned] if mentioned else orders[:3]

    if not orders:
        facts.append("This session has no orders yet.")
    else:
        facts.append(f"This session has {len(orders)} order(s). Most recent first:")
        facts.extend(_order_line(o) for o in shown)
        for o in shown:
            if o["risk_reasons"]:
                facts.append(f"Risk notes for {o['id']}: " + "; ".join(o["risk_reasons"]))

    ins = services.insights(db, session_id)
    b = ins["budget"]
    if b["budget"] is None:
        facts.append("No session budget is set.")
    else:
        facts.append(f"Session budget {b['budget']:g}, spent {b['spent']:g}, "
                     f"remaining {b['remaining']:g}.")
    facts.extend(_store_rules())
    return facts, shown


def _support_rules(message: str, db: Session, session_id: str, shown: list[dict]) -> str:
    q = message.lower()
    orders = services.orders_for_session(db, session_id)

    if re.search(r"refund|cancel|return", q):
        return ("I can't process refunds, cancellations or returns here. "
                "Please contact the store with your order id"
                + (f" ({orders[0]['id']})." if orders else "."))

    if re.search(r"twice|duplicate|double", q):
        return ("Checkout uses an idempotency key. If a request is retried or clicked twice, "
                "the same order is returned and you are not charged again. "
                + (f"Your latest order is {orders[0]['id']}; check Orders for duplicates."
                   if orders else "You have no orders in this session yet."))

    if re.search(r"block|declin|fail|rejected|why.*(payment|order)", q):
        risky = [o for o in orders if o["risk_reasons"] or o["status"] not in ("COMPLETED", "CREATED")]
        if risky:
            o = risky[0]
            why = "; ".join(o["risk_reasons"]) or f"its status is {o['status']}"
            return f"{o['id']} was flagged because {why}."
        return ("Payments are blocked if you did not approve them, or if 3 or more orders are "
                "placed within 10 minutes. They go to review when above 500, above twice your "
                "budget, or when the coupon code is unknown. I see no flagged orders in this session.")

    if re.search(r"coupon|promo|discount code", q):
        lines = [f"{code}: {c['description']}" for code, c in COUPONS.items()]
        return "Valid coupons are " + "; ".join(lines) + ". The best valid one is applied automatically."

    if re.search(r"shipping|delivery", q):
        return (f"Shipping is free once the total after discounts reaches "
                f"{settings.free_shipping_threshold:g} {settings.currency}; below that it is a flat "
                f"{settings.flat_shipping_fee:g}. I don't have delivery dates.")

    if re.search(r"spent|budget", q):
        ins = services.insights(db, session_id)
        b = ins["budget"]
        if b["budget"] is None:
            return f"No budget is set. You have spent {b['spent']:g} {ins['currency']} so far."
        return (f"Budget {b['budget']:g}, spent {b['spent']:g}, "
                f"remaining {b['remaining']:g} {ins['currency']}.")

    if re.search(r"paypal|pay|checkout", q) and not shown:
        return ("At checkout you approve the payment, then PayPal creates the order and you "
                "capture it. Without sandbox credentials the app uses a mock PayPal order.")

    if not orders:
        return "You have no orders in this session yet. Search for a product and check out to create one."
    if len(shown) == 1:
        return _order_line(shown[0]) + "."
    return "Your recent orders: " + " | ".join(_order_line(o) for o in shown)


async def _support(db: Session, session_id: str, message: str, history: list[dict]) -> dict:
    facts, shown = _support_facts(db, session_id, message)
    trace = ["Support agent loaded this session's orders and store rules"]

    fallback = _support_rules(message, db, session_id, shown)
    reply, provider = fallback, "rules"

    convo = "\n".join(f"{m['role']}: {m['text']}" for m in history[-6:])
    prompt = "Facts:\n" + "\n".join(f"- {f}" for f in facts)
    if convo:
        prompt += f"\n\nConversation so far:\n{convo}"
    prompt += f"\n\nCustomer question: {message}"

    llm = await _llm(SYSTEM_PROMPT, prompt)
    if llm:
        reply, provider = llm
        trace.append(f"Support agent phrased the answer with {provider}")
    else:
        trace.append("Support agent answered from rules (no LLM key or call failed)")

    return {"mode": "support", "reply": reply, "search": None,
            "orders": shown, "trace": trace, "provider": provider}


# ---------- Shopping ----------

def _shop_reply(result: dict) -> str:
    if not result["matrix"]:
        return result["message"] or "I could not find a match. Try a higher budget or fewer constraints."

    top = next(r for r in result["matrix"] if r["product"]["id"] == result["top_pick"])
    p = top["product"]
    cart = result["cart"]
    parts = [
        f"Top pick: {p['name']} at {p['price']:,.2f}. "
        f"Spec match {round(top['match_score'] * 100)}%, review trust {top['trust_score']}%."
    ]
    if top["missed"]:
        parts.append("It misses: " + ", ".join(top["missed"]) + ".")
    if top["flagged_reviews"]:
        parts.append(f"{top['flagged_reviews']} suspicious review(s) were removed before scoring.")
    if cart and cart["coupon"]:
        parts.append(f"Coupon {cart['coupon']['code']} saves {cart['coupon']['saving']:,.2f}. "
                     f"Cart total is {cart['total']:,.2f}.")
    elif cart:
        parts.append(f"Cart total with shipping is {cart['total']:,.2f}.")

    budget = result.get("budget")
    if budget and budget.get("budget") is not None and result["alternatives"]:
        names = ", ".join(a["product"]["name"] for a in result["alternatives"][:2])
        parts.append(f"That is over your remaining budget. Cheaper options: {names}.")
    return " ".join(parts)


async def _shop(db: Session, session_id: str, message: str, coupon_code: str | None) -> dict:
    services.ensure_session(db, session_id)
    shopping = db.get(services.ShoppingSession, session_id)
    result = await run_pipeline(
        message,
        coupon_code=coupon_code,
        session_budget=shopping.budget,
        spent_so_far=services.spent_so_far(db, session_id),
    )
    services.record_run(db, session_id, message, result)
    return {"mode": "shop", "reply": _shop_reply(result), "search": result,
            "orders": None, "trace": result["trace"], "provider": result["intent"]["source"]}


# ---------- Entry point ----------

async def chat(db: Session, *, session_id: str, message: str,
               history: list[dict] | None = None, coupon_code: str | None = None) -> dict:
    services.ensure_session(db, session_id)
    history = history or []
    if route(message) == "support":
        return await _support(db, session_id, message, history)
    return await _shop(db, session_id, message, coupon_code)
