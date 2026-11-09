"""Live Google Shopping (India) client via SerpApi (google_shopping_light)."""

from __future__ import annotations

import hashlib
import logging
from typing import Any

import httpx

from app.catalog import register_live_product
from app.config import settings

logger = logging.getLogger("smartcart.serp")

# In-memory cache so repeated queries use 0 API credits and respond in 0ms
_SEARCH_CACHE: dict[str, list[dict[str, Any]]] = {}

# Reusable HTTP client with persistent connection pool to eliminate TLS handshake overhead
_HTTP_CLIENT = httpx.AsyncClient(
    timeout=httpx.Timeout(connect=2.5, read=5.0, write=2.5, pool=2.5),
    limits=httpx.Limits(max_keepalive_connections=10, max_connections=20),
)


async def search_indian_market(query: str, category: str | None = None, max_price: float | None = None) -> list[dict[str, Any]]:
    """Search Google Shopping India live using SerpApi google_shopping_light with low latency."""
    if not settings.serpapi_api_key:
        return []

    # Normalized cache key
    clean_q = " ".join(query.strip().lower().split())
    cache_key = f"{clean_q}:{max_price}"
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
        resp = await _HTTP_CLIENT.get("https://serpapi.com/search", params=params)
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:
        logger.warning("SerpApi request failed or timed out: %s. Falling back to local catalog.", exc)
        return []

    # Slice top 20 items to keep payload lightweight and fast
    raw_items = data.get("shopping_results", [])[:20]
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
