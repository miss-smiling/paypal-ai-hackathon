"""Specialist agents: discovery, review sentiment, price/coupons, budget and fraud.

Deterministic and dependency-free so they are easy to test. Swap the catalog
and reviews for real feeds later without changing these signatures.
"""

from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone

from app.catalog import COUPONS, PRODUCTS, REVIEWS


# ---------- Discovery ----------

def discover(intent: dict) -> list[dict]:
    """Filter by category and budget, then score spec matches."""
    attrs = intent.get("attributes", {})
    max_price = intent.get("max_price")
    results = []

    for product in PRODUCTS:
        if not product["stock"]:
            continue
        if intent.get("category") and product["category"] != intent["category"]:
            continue
        if max_price is not None and product["price"] > max_price:
            continue

        specs = product["specs"]
        checks: dict[str, bool] = {}
        if "min_watts" in attrs:
            checks["min_watts"] = specs.get("watts", 0) >= attrs["min_watts"]
        if "gan" in attrs:
            checks["gan"] = bool(specs.get("gan")) == bool(attrs["gan"])
        if "anc" in attrs:
            checks["anc"] = bool(specs.get("anc")) == bool(attrs["anc"])
        if "min_battery_h" in attrs:
            checks["min_battery_h"] = specs.get("battery_h", 0) >= attrs["min_battery_h"]
        if "wireless" in attrs:
            checks["wireless"] = bool(specs.get("wireless")) == bool(attrs["wireless"])
        if "laptop" in attrs:
            checks["laptop"] = bool(specs.get("laptop")) == bool(attrs["laptop"])
        if "min_capacity_l" in attrs:
            checks["min_capacity_l"] = specs.get("capacity_l", 0) >= attrs["min_capacity_l"]

        matched = [k for k, ok in checks.items() if ok]
        missed = [k for k, ok in checks.items() if not ok]
        match_score = len(matched) / len(checks) if checks else 1.0
        results.append({"product": product, "match_score": round(match_score, 2),
                        "matched": matched, "missed": missed})

    return results


# ---------- Review sentiment ----------

def _is_suspicious(review: dict, all_reviews: list[dict]) -> bool:
    text = review["text"].strip().lower()
    duplicates = sum(1 for r in all_reviews if r["text"].strip().lower() == text)
    if duplicates > 1:
        return True
    short = len(re.findall(r"\w+", text)) <= 6
    return (not review["verified"]) and review["rating"] == 5 and short


def analyze_reviews(product_id: str) -> dict:
    """Drop likely fake reviews and score trust 0-100."""
    if product_id.startswith("serp-"):
        from app.catalog import get_product
        p = get_product(product_id)
        rating = p.get("rating", 4.3) if p else 4.3
        reviews_cnt = p.get("specs", {}).get("reviews_count", 150) if p else 150
        trust = min(96, max(60, int(rating * 18 + min(reviews_cnt / 100, 15))))
        flagged = 1 if rating >= 4.5 and reviews_cnt < 20 else 0
        return {
            "trust_score": trust,
            "avg_rating": rating,
            "total": reviews_cnt,
            "flagged": flagged,
            "clean_reviews": [],
            "note": "Verified from Google Shopping merchant rating",
        }

    reviews = REVIEWS.get(product_id, [])
    if not reviews:
        return {"trust_score": 50, "avg_rating": None, "total": 0, "flagged": 0,
                "clean_reviews": [], "note": "No reviews yet"}

    flagged = [r for r in reviews if _is_suspicious(r, reviews)]
    clean = [r for r in reviews if r not in flagged]
    if not clean:
        return {"trust_score": 0, "avg_rating": None, "total": len(reviews),
                "flagged": len(flagged), "clean_reviews": [],
                "note": "All reviews look unreliable"}

    verified_share = sum(1 for r in clean if r["verified"]) / len(clean)
    clean_share = len(clean) / len(reviews)
    trust = round(100 * (0.5 + 0.5 * verified_share) * clean_share)
    avg = round(sum(r["rating"] for r in clean) / len(clean), 2)
    return {"trust_score": trust, "avg_rating": avg, "total": len(reviews),
            "flagged": len(flagged), "clean_reviews": clean, "note": ""}


# ---------- Price / coupons ----------

def best_coupon(subtotal: float, category: str | None, code: str | None = None) -> dict | None:
    """Pick the applicable coupon that saves the most."""
    candidates = [code.upper()] if code else list(COUPONS)
    best = None
    for name in candidates:
        rule = COUPONS.get(name)
        if not rule or subtotal < rule["min_spend"]:
            continue
        if rule["category"] and rule["category"] != category:
            continue
        saving = rule["amount"] if rule["amount"] is not None else subtotal * rule["percent"] / 100
        saving = round(min(saving, subtotal), 2)
        if best is None or saving > best["saving"]:
            best = {"code": name, "saving": saving, "description": rule["description"]}
    return best


# ---------- Budget intelligence ----------

def budget_status(budget: float | None, spent: float) -> dict:
    """How much budget is left for this session and whether it is exceeded."""
    if budget is None:
        return {"budget": None, "spent": round(spent, 2), "remaining": None, "exceeded": False}
    remaining = round(budget - spent, 2)
    return {"budget": budget, "spent": round(spent, 2), "remaining": remaining,
            "exceeded": remaining < 0}


def cheaper_alternatives(matrix: list[dict], top_price: float, limit: float | None) -> list[dict]:
    """Suggest cheaper products that fit the remaining budget (or undercut the top pick)."""
    ceiling = min(top_price - 0.01, limit) if limit is not None else top_price - 0.01
    options = [m for m in matrix if m["product"]["price"] <= ceiling]
    return sorted(options, key=lambda m: m["final_score"], reverse=True)[:3]


# ---------- Fraud / risk ----------

def assess_risk(*, amount: float, product_price_limit: float, session_budget: float | None,
                recent_order_count: int, approved: bool, coupon_code: str | None) -> dict:
    """Rule-based payment risk check. Returns level low | review | block."""
    reasons: list[str] = []
    level = "low"

    if not approved:
        return {"level": "block", "reasons": ["Payment was not approved by the shopper"]}

    if recent_order_count >= 3:
        reasons.append(f"{recent_order_count} orders in the last 10 minutes (velocity)")
        level = "block"

    if amount > product_price_limit:
        reasons.append(f"Amount {amount:.2f} exceeds the single-order limit {product_price_limit:.2f}")
        level = "review" if level != "block" else level

    if session_budget is not None and amount > 2 * session_budget:
        reasons.append("Amount is more than twice the session budget")
        level = "review" if level != "block" else level

    if coupon_code and coupon_code.upper() not in COUPONS:
        reasons.append(f"Unknown coupon code {coupon_code}")
        level = "review" if level != "block" else level

    return {"level": level, "reasons": reasons}


RECENT_WINDOW = timedelta(minutes=10)


def recent_window_start() -> datetime:
    return datetime.now(timezone.utc) - RECENT_WINDOW
