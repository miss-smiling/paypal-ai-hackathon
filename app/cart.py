"""SmartCart Optimizer: ranks candidates and prices the cart."""

from __future__ import annotations

from app.agents import best_coupon
from app.config import settings


def rank(candidates: list[dict], trust_by_id: dict[str, int]) -> list[dict]:
    """Score = 50% spec match + 30% trust + 20% value (cheaper within the set scores higher)."""
    if not candidates:
        return []
    max_price = max(c["product"]["price"] for c in candidates)
    ranked = []
    for c in candidates:
        product = c["product"]
        trust = trust_by_id.get(product["id"], 0)
        value = 1 - (product["price"] / max_price) if max_price else 0
        final = 0.5 * c["match_score"] + 0.3 * (trust / 100) + 0.2 * value
        ranked.append({**c, "trust_score": trust, "value_score": round(value, 2),
                       "final_score": round(final, 3)})
    ranked.sort(key=lambda r: r["final_score"], reverse=True)
    return ranked


def build_ledger(products: list[dict], coupon_code: str | None = None) -> dict:
    """Price a cart: subtotal, best (or requested) coupon, shipping and total."""
    subtotal = round(sum(p["price"] for p in products), 2)
    category = products[0]["category"] if len(products) == 1 else None
    coupon = best_coupon(subtotal, category, coupon_code)
    discount = coupon["saving"] if coupon else 0.0

    after_discount = round(subtotal - discount, 2)
    shipping = 0.0 if after_discount >= settings.free_shipping_threshold else settings.flat_shipping_fee
    total = round(after_discount + shipping, 2)

    return {
        "items": [
            {
                "id": p["id"],
                "name": p["name"],
                "price": p["price"],
                "image_url": p.get("image_url"),
            }
            for p in products
        ],
        "subtotal": subtotal,
        "coupon": coupon,
        "discount": discount,
        "shipping": shipping,
        "total": total,
        "currency": settings.currency,
    }
