"""Intent Understanding Agent.

Turns a natural-language query into structured constraints.
Uses Gemini if GEMINI_API_KEY is set, else OpenAI if OPENAI_API_KEY is set,
else a rule-based parser (always works, no keys needed).
"""

from __future__ import annotations

import json
import re

import httpx

from app.config import settings

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "charger": ["charger", "charging", "gan", "usb-c", "power adapter", "wall adapter"],
    "headphones": ["headphone", "earbud", "anc", "over-ear", "noise cancel"],
    "keyboard": ["keyboard"],
    "backpack": ["backpack", "daypack", "rucksack"],
}

PROMPT = (
    "Extract shopping constraints from the request. Reply with JSON only, keys: "
    '"category" (one of charger, headphones, keyboard, backpack, or null), '
    '"max_price" (number or null), '
    '"attributes" (object; allowed keys: min_watts, gan, anc, min_battery_h, '
    "wireless, laptop, min_capacity_l).\n\nRequest: "
)


def rule_parse(query: str) -> dict:
    q = query.lower()

    category = None
    for cat, words in CATEGORY_KEYWORDS.items():
        if any(re.search(rf"\b{re.escape(w)}", q) for w in words):
            category = cat
            break

    max_price = None
    m = re.search(r"(?:under|below|less than|max|up to|within|<=?)\s*(?:\$|₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)", q)
    if m:
        max_price = float(m.group(1).replace(",", ""))

    attributes: dict = {}
    m = re.search(r"(\d+)\s*w\b", q)
    if m:
        attributes["min_watts"] = int(m.group(1))
    if re.search(r"\bgan\b", q):
        attributes["gan"] = True
    if re.search(r"\banc\b|noise cancel", q):
        attributes["anc"] = True
    m = re.search(r"(\d+)\s*(?:h|hrs?|hours?)\b", q)
    if m:
        attributes["min_battery_h"] = int(m.group(1))
    if re.search(r"wireless|bluetooth", q):
        attributes["wireless"] = True
    if re.search(r"laptop", q):
        attributes["laptop"] = True
    m = re.search(r"(\d+)\s*l\b", q)
    if m:
        attributes["min_capacity_l"] = int(m.group(1))

    return {"category": category, "max_price": max_price, "attributes": attributes, "source": "rules"}


def _clean(data: dict, source: str) -> dict | None:
    if not isinstance(data, dict):
        return None
    max_price = data.get("max_price")
    attrs = data.get("attributes")
    return {
        "category": data.get("category") if data.get("category") in CATEGORY_KEYWORDS else None,
        "max_price": float(max_price) if isinstance(max_price, (int, float)) else None,
        "attributes": attrs if isinstance(attrs, dict) else {},
        "source": source,
    }


async def _gemini(query: str) -> dict | None:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent"
    body = {
        "contents": [{"parts": [{"text": PROMPT + query}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0},
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(url, json=body, headers={"x-goog-api-key": settings.gemini_api_key})
        resp.raise_for_status()
        text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    return _clean(json.loads(text), "gemini")


async def _openai(query: str) -> dict | None:
    body = {
        "model": settings.openai_model,
        "temperature": 0,
        "response_format": {"type": "json_object"},
        "messages": [{"role": "user", "content": PROMPT + query}],
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            json=body,
            headers={"Authorization": f"Bearer {settings.openai_api_key}"},
        )
        resp.raise_for_status()
        text = resp.json()["choices"][0]["message"]["content"]
    return _clean(json.loads(text), "openai")


async def parse_intent(query: str) -> dict:
    parsed = None
    try:
        if settings.gemini_api_key:
            parsed = await _gemini(query)
        elif settings.openai_api_key:
            parsed = await _openai(query)
    except Exception:
        parsed = None  # fall back to rules if the LLM call fails
    parsed = parsed or rule_parse(query)
    parsed["raw"] = query
    return parsed
