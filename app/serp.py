"""Live Google Shopping (India) client via SerpApi (google_shopping_light)."""

from __future__ import annotations

import hashlib
import logging
from typing import Any

import httpx

from app.catalog import register_live_product
from app.config import settings

logger = logging.getLogger("smartcart.serp")

# In-memory cache so repeated queries use 0 API credits
_SEARCH_CACHE: dict[str, list[dict[str, Any]]] = {}


async def search_indian_market(query: str, category: str | None = None, max_price: float | None = None) -> list[dict[str, Any]]:
    """Search Google Shopping India live using SerpApi google_shopping_light."""
    if not settings.serpapi_api_key:
        return []

    cache_key = f"{query.strip().lower()}:{max_price}"
    if cache_key in _SEARCH_CACHE:
        return _SEARCH_CACHE[cache_key]

    params = {
        "engine": "google_shopping_light",
        "q": query,
        "gl": "in",
        "hl": "en",
        "google_domain": "google.co.in",
        "api_key": settings.serpapi_api_key,
    }

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.get("https://serpapi.com/search", params=params)
            resp.raise_for_status()
            data = resp.json()
    except Exception as exc:
        logger.warning("SerpApi request failed: %s. Falling back to local catalog.", exc)
        return []

    raw_items = data.get("shopping_results", [])
    products: list[dict[str, Any]] = []

    for item in raw_items:
        title = item.get("title")
        extracted_price = item.get("extracted_price")
        if not title or extracted_price is None:
            continue

        price = float(extracted_price)
        if max_price is not None and price > max_price:
            continue

        pid = f"serp-{hashlib.md5(title.encode()).hexdigest()[:10]}"
        merchant = item.get("source") or "Online Store"
        rating = float(item.get("rating", 4.3))
        reviews_cnt = int(item.get("reviews", 100))
        thumbnail = item.get("thumbnail")

        prod = {
            "id": pid,
            "name": title,
            "brand": merchant,
            "category": category or "general",
            "price": price,
            "rating": rating,
            "specs": {
                "merchant": merchant,
                "reviews_count": reviews_cnt,
                "link": item.get("link"),
                "delivery": item.get("delivery"),
            },
            "stock": True,
            "image_url": thumbnail,
        }

        # Register so it can be added to the cart and checked out with PayPal
        register_live_product(prod)
        products.append(prod)

    _SEARCH_CACHE[cache_key] = products
    return products
