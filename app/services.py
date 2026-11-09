"""Business logic that touches the database: sessions, checkout, capture, insights."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app import paypal
from app.agents import assess_risk, budget_status, recent_window_start
from app.cart import build_ledger
from app.catalog import get_product
from app.config import settings
from app.db import AgentRun, Order, ShoppingSession

SINGLE_ORDER_LIMIT = 500.0


class CheckoutBlocked(Exception):
    def __init__(self, reasons: list[str]):
        super().__init__("; ".join(reasons))
        self.reasons = reasons


class NotFound(Exception):
    pass


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def ensure_session(db: Session, session_id: str) -> ShoppingSession:
    shopping = db.get(ShoppingSession, session_id)
    if shopping is None:
        shopping = ShoppingSession(id=session_id)
        db.add(shopping)
        db.commit()
    return shopping


def set_budget(db: Session, session_id: str, budget: float | None) -> ShoppingSession:
    shopping = ensure_session(db, session_id)
    shopping.budget = budget
    db.commit()
    return shopping


def _session_orders(db: Session, session_id: str) -> list[Order]:
    return list(db.scalars(select(Order).where(Order.session_id == session_id)))


def spent_so_far(db: Session, session_id: str) -> float:
    return round(sum(o.amount for o in _session_orders(db, session_id) if o.status == "COMPLETED"), 2)


def record_run(db: Session, session_id: str, query: str, result: dict) -> None:
    db.add(AgentRun(session_id=session_id, query=query,
                    top_pick=result.get("top_pick"), trace=result.get("trace", [])))
    db.commit()


async def create_checkout(db: Session, *, session_id: str,
                                product_id: str | None = None,
                                product_ids: list[str] | None = None,
                                coupon_code: str | None = None, approved: bool = False,
                                idempotency_key: str) -> dict:
    existing = db.scalar(select(Order).where(Order.idempotency_key == idempotency_key))
    if existing:
        return _order_view(existing, replayed=True)

    items = []
    if product_ids:
        for pid in product_ids:
            p = get_product(pid)
            if p:
                items.append(p)
    elif product_id:
        p = get_product(product_id)
        if p:
            items.append(p)

    if not items:
        raise NotFound("Unknown product(s)")

    shopping = ensure_session(db, session_id)
    ledger = build_ledger(items, coupon_code)

    window_start = recent_window_start()
    recent = sum(1 for o in _session_orders(db, session_id) if _aware(o.created_at) >= window_start)
    risk = assess_risk(
        amount=ledger["total"],
        product_price_limit=SINGLE_ORDER_LIMIT,
        session_budget=shopping.budget,
        recent_order_count=recent,
        approved=approved,
        coupon_code=coupon_code,
    )
    if risk["level"] == "block":
        raise CheckoutBlocked(risk["reasons"] or ["Payment blocked by risk check"])

    ref_id = items[0]["id"] if len(items) == 1 else f"bundle-{len(items)}"
    prod_names = ", ".join(i["name"] for i in items[:2]) + (f" + {len(items)-2} more" if len(items) > 2 else "")
    primary_category = items[0]["category"] if len(items) == 1 else "bundle"

    paypal_order = await paypal.create_order(
        ledger["total"], ledger["currency"], ref_id, request_id=idempotency_key)

    order = Order(
        id=paypal_order["id"],
        session_id=session_id,
        product_id=ref_id,
        product_name=prod_names,
        category=primary_category,
        amount=ledger["total"],
        currency=ledger["currency"],
        status=paypal_order["status"],
        mock=paypal_order["mock"],
        risk_level=risk["level"],
        risk_reasons=risk["reasons"],
        idempotency_key=idempotency_key,
        approved_at=datetime.now(timezone.utc),
    )
    db.add(order)
    db.commit()
    return {**_order_view(order), "approve_url": paypal_order.get("approve_url"), "ledger": ledger}


async def capture(db: Session, order_id: str) -> dict:
    order = db.get(Order, order_id)
    if order is None:
        raise NotFound("Unknown order")
    if order.status == "COMPLETED":
        return _order_view(order)

    result = await paypal.capture_order(order_id, request_id=f"capture-{order_id}")
    order.status = result["status"]
    db.commit()
    return _order_view(order)


def mark_completed(db: Session, order_id: str) -> bool:
    order = db.get(Order, order_id)
    if order is None:
        return False
    order.status = "COMPLETED"
    db.commit()
    return True


def _order_view(order: Order, replayed: bool = False) -> dict:
    return {
        "id": order.id,
        "status": order.status,
        "mock": order.mock,
        "total": order.amount,
        "currency": order.currency,
        "product_id": order.product_id,
        "product_name": order.product_name,
        "risk_level": order.risk_level,
        "risk_reasons": order.risk_reasons,
        "replayed": replayed,
    }


def orders_for_session(db: Session, session_id: str) -> list[dict]:
    orders = sorted(_session_orders(db, session_id), key=lambda o: o.created_at, reverse=True)
    return [_order_view(o) for o in orders]


def insights(db: Session, session_id: str) -> dict:
    shopping = db.get(ShoppingSession, session_id)
    budget = shopping.budget if shopping else None
    orders = _session_orders(db, session_id)
    completed = [o for o in orders if o.status == "COMPLETED"]
    spent = round(sum(o.amount for o in completed), 2)

    by_category: dict[str, float] = {}
    for o in completed:
        by_category[o.category] = round(by_category.get(o.category, 0) + o.amount, 2)

    runs = list(db.scalars(select(AgentRun).where(AgentRun.session_id == session_id)))
    return {
        "session_id": session_id,
        "budget": budget_status(budget, spent),
        "orders_total": len(orders),
        "orders_completed": len(completed),
        "spend_by_category": by_category,
        "searches": len(runs),
        "currency": settings.currency,
    }
