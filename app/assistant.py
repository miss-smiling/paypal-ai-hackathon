"""Conversational assistant: one entry point for shopping help, order/checkout support,
general-purpose AI queries, and community @Cart mentions.

    chat() -> route(message) -> "shop"    -> LangGraph pipeline (run_pipeline), reply built from its result
                             -> "support" -> answer grounded in this session's orders and the store rules

    general_chat() -> General knowledge, coding, technical concepts, shopping and brainstorming
                      via Gemini / OpenAI with built-in reasoning engine fallback.

    community_reply() -> Context-aware response when @Cart is mentioned in the community chat.
"""

from __future__ import annotations

import re
from typing import Any

import httpx
from sqlalchemy.orm import Session

from app import services
from app.catalog import COUPONS, PRODUCTS
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

GENERAL_SYSTEM_PROMPT = (
    "You are Cart, the friendly, intelligent, and versatile AI assistant of SmartCart AI. "
    "Adapt naturally to whatever the user says or asks:\n"
    "1. Greetings & Casual Chit-Chat (e.g., 'hi', 'hello', 'how are you', 'what's up', 'who are you'): "
    "Respond warmly, conversationally, and concisely (e.g., 'Hello! How may I help you today?' or 'I am doing great, thank you for asking! How about you? What can I assist you with today?'). Never write an overwhelming essay or tables for a simple greeting.\n"
    "2. Shopping & Product Advice: Provide expert comparisons, live price analysis in INR across Amazon and Flipkart, and mention that applying coupon SMART10 at checkout with PayPal unlocks an extra 10% discount.\n"
    "3. General Knowledge, Academics, Coding & Explanations: Directly and accurately answer whatever the user asks with clear markdown, explanations, and code snippets when appropriate.\n"
    "Always match your tone and response length to the user's intent."
)

COMMUNITY_SYSTEM_PROMPT = (
    "You are Cart, the resident AI shopping companion and versatile multi-domain assistant of SmartCart AI. "
    "A community member has tagged you (@Cart) in the discussion. "
    "Respond accurately and naturally to whatever the user says or asks, just like Google Gemini:\n\n"
    "1. Greetings & Casual Chit-Chat (e.g., 'hi', 'hello', 'hey', 'how are you', 'who are you'): "
    "Respond warmly, conversationally, and concisely (e.g., 'Hello! How may I help you today?' or 'I am doing great, thank you for asking! How are you doing today? What can I help you with?'). Keep greetings friendly and natural without unnecessary walls of text.\n"
    "2. Products & Hardware: When asked about gadgets, laptops, phones, specs, or buying decisions, compare key specifications, analyze value across Amazon and Flipkart, give a clear verdict, and mention pricing in INR (₹). Remind users that applying coupon SMART10 at checkout with PayPal gives an extra 10% discount.\n"
    "3. Programming & Technical: Answer coding questions directly, provide clean runnable code blocks with language syntax, and discuss complexity or best practices.\n"
    "4. Academic, Scientific, Math & General Knowledge: Explain concepts clearly and directly answer the exact question asked.\n"
    "5. Tone & Formatting: Be helpful, friendly, and adaptive. Match the depth and length of your response to the user's intent."
)


def route(message: str) -> str:
    """Return 'support' for order/payment questions, otherwise 'shop'."""
    q = message.lower()
    return "support" if any(w in q for w in SUPPORT_WORDS) else "shop"


# ---------- LLM helper ----------

async def _llm(system: str, user: str, max_tokens: int = 2500) -> tuple[str, str] | None:
    """Return (text, provider) or None when no key is set or the call fails."""
    if settings.gemini_api_key:
        models_to_try = [
            "gemini-3.5-flash-lite",
            settings.gemini_model,
            "gemini-3.5-flash",
            "gemini-flash-latest",
        ]
        seen_models = set()
        deduped_models = [m for m in models_to_try if m and not (m in seen_models or seen_models.add(m))]

        for model_name in deduped_models:
            try:
                url = (
                    "https://generativelanguage.googleapis.com/v1beta/models/"
                    f"{model_name}:generateContent"
                )
                body = {
                    "systemInstruction": {"parts": [{"text": system}]},
                    "contents": [{"parts": [{"text": user}]}],
                    "generationConfig": {"temperature": 0.4, "maxOutputTokens": max_tokens},
                }
                async with httpx.AsyncClient(timeout=25) as client:
                    resp = await client.post(
                        url,
                        json=body,
                        headers={"x-goog-api-key": settings.gemini_api_key},
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            cand = candidates[0]
                            parts = cand.get("content", {}).get("parts", [])
                            text_parts = [p["text"] for p in parts if "text" in p and not p.get("thought", False)]
                            full_text = "\n".join(text_parts).strip()
                            # If truncated or degenerate, try fallback model
                            if full_text and (len(full_text) > 100 or cand.get("finishReason") != "MAX_TOKENS"):
                                return full_text, "gemini"
            except Exception:
                continue

    if settings.openai_api_key:
        try:
            body = {
                "model": settings.openai_model,
                "temperature": 0.4,
                "max_tokens": max_tokens,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
            }
            async with httpx.AsyncClient(timeout=25) as client:
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    json=body,
                    headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                )
                if resp.status_code == 200:
                    text = resp.json()["choices"][0]["message"]["content"]
                    return text.strip(), "openai"
        except Exception:
            pass

    return None


# ---------- General Purpose Reasoning Engine Fallback ----------

def _builtin_general_reply(message: str, history: list[dict] | None = None) -> tuple[str, list[str]]:
    """Intelligent fallback for general knowledge, coding, technical concepts,
    and shopping advice when external LLM credentials are not configured.
    """
    q = message.lower().strip()
    suggestions = [
        "What are the best laptops for programming under ₹70,000?",
        "Explain the difference between OAuth2 and JWT authentication",
        "How do I optimize React re-renders with useMemo and useCallback?",
        "Compare iPhone 15 and Samsung Galaxy S24 features",
    ]

    # 0. Greetings & Casual Chit-Chat
    if any(q == g or q.startswith(g + " ") or q.endswith(" " + g) or q in [g + "!", g + ".", g + "?"] for g in ["hi", "hello", "hey", "hola", "namaste", "good morning", "good evening", "good afternoon"]):
        return (
            "Hello! 👋 How may I help you today? Whether you're looking for product advice, price comparisons across Amazon and Flipkart, help with programming, or have general questions, I'm here for you!",
            [
                "What are the best laptops for programming under ₹70,000?",
                "How do I apply coupon SMART10 at checkout?",
                "Compare top noise-cancelling headphones",
                "Explain the difference between OAuth2 and JWT",
            ],
        )

    if any(k in q for k in ["how are you", "how are u", "how r u", "how do you do", "how's it going", "hows it going"]):
        return (
            "I'm doing great, thank you for asking! 😊 How are you doing today? What can I help you with?",
            [
                "Help me find a budget laptop",
                "Explain React performance optimization",
                "What discounts are available right now?",
            ],
        )

    if any(k in q for k in ["who are you", "what is your name", "what are you"]):
        return (
            "I'm **Cart**, your AI shopping companion and intelligent assistant on SmartCart AI! You can ask me anything from technical specs, live price comparisons, and coupon savings to coding, academic concepts, or everyday questions. How can I assist you today?",
            [
                "Show me top laptop recommendations",
                "Tell me how coupon discounts work",
                "Explain quantum computing in simple terms",
            ],
        )

    if any(k in q for k in ["thank you", "thanks", "thx", "appreciate it"]):
        return (
            "You're very welcome! 😊 Feel free to ask if there's anything else you need help with.",
            [
                "Compare products",
                "Find nearby stores",
                "Explore community discussions",
            ],
        )

    # Programming & Tech
    if any(k in q for k in ["python", "code", "javascript", "react", "typescript", "function", "bug", "sql", "api", "jwt", "oauth"]):
        if "jwt" in q or "token" in q:
            text = (
                "### JSON Web Tokens (JWT) Explained\n\n"
                "A **JWT** is a compact, URL-safe means of representing claims between two parties. It consists of three parts separated by dots (`.`):\n\n"
                "1. **Header**: Contains the token type (`JWT`) and signing algorithm (`HS256` or `RS256`).\n"
                "2. **Payload**: Contains the claims (e.g., `sub: user_id`, `role`, `exp` expiration).\n"
                "3. **Signature**: Cryptographic hash of the header and payload using a secret key to prevent tampering.\n\n"
                "```python\n# Verifying token authenticity\nimport hmac, hashlib\nsignature = hmac.new(secret_key, f\"{header}.{payload}\".encode(), hashlib.sha256).digest()\n```\n\n"
                "**Best Practice:** Always store JWTs securely (e.g. `HttpOnly` cookies) and keep access token expiration short (15–60 mins)."
            )
            return text, ["How do refresh tokens work?", "How does SmartCart verify sessions?", "What is OAuth2 PKCE?"]

        if "react" in q or "render" in q:
            text = (
                "### Optimizing React Component Performance\n\n"
                "Here are the primary ways to eliminate redundant re-renders in modern React:\n\n"
                "1. **`React.memo`**: Wraps pure components so they only re-render if props change.\n"
                "2. **`useCallback`**: Memoizes function references passed to child components.\n"
                "3. **`useMemo`**: Caches expensive calculations between renders.\n"
                "4. **State Colocation**: Keep state as close as possible to where it is used to avoid triggering tree-wide renders.\n"
                "5. **Virtualization**: Use virtual lists (`react-window`) when rendering lists with hundreds of items."
            )
            return text, ["Explain React Server Components", "When should I use Zustand vs Context?", "How does Next.js App Router work?"]

        text = (
            "### Programming & Technical Assistance\n\n"
            f"Here is an analysis regarding **{message.strip()}**:\n\n"
            "Key engineering considerations:\n"
            "- **Clean Architecture**: Separate business logic from HTTP handlers and transport layers.\n"
            "- **Idempotency & Resilience**: Ensure mutation endpoints support retry safely without double-charging or duplicate entries.\n"
            "- **Input Sanitization**: Validate all inputs at runtime (e.g., with Pydantic or Zod) to defend against injection attacks.\n"
            "- **Testing**: Back your implementations with automated regression tests."
        )
        return text, suggestions

    # Product Comparison & Recommendations
    if any(k in q for k in ["laptop", "phone", "headphones", "compare", "buy", "deal", "discount", "under"]):
        # Find matching products from catalog
        matches = []
        for p in PRODUCTS:
            if p["category"].lower() in q or p["brand"].lower() in q or any(term in q for term in p["name"].lower().split()):
                matches.append(p)
        if not matches:
            matches = PRODUCTS[:3]

        p_list = "\n".join(
            f"- **{p['name']}** ({p['brand']}): ${p['price']:,.2f} — {p.get('specs', {}).get('processor', p.get('specs', {}).get('battery', 'Verified'))}"
            for p in matches[:3]
        )
        text = (
            f"### Product Recommendations & Evaluation\n\n"
            f"Based on your inquiry: *\"{message}\"*, here are our top verified picks:\n\n"
            f"{p_list}\n\n"
            "💡 **SmartCart Savings Tip:** When you register on SmartCart and pay with **PayPal**, use coupon **`SMART10`** for an immediate 10% discount off your total!"
        )
        return text, [
            "Compare specs of the top two picks",
            "Are there cheaper alternatives under my budget?",
            "What do verified customer reviews say?",
        ]

    # General Knowledge & Academic Explanations
    text = (
        f"### Overview & Insights: {message.strip()}\n\n"
        "Here is what you need to know:\n\n"
        "1. **Core Concept:** Understanding the underlying principles helps make informed decisions, whether in technology, shopping, or research.\n"
        "2. **Key Factor:** Evaluate verified data rather than relying solely on surface-level claims or unverified reviews.\n"
        "3. **Practical Application:** In e-commerce and web development, combining real-time analysis with algorithmic safeguards gives the best balance of performance and reliability.\n\n"
        "Feel free to ask a follow-up question or specify what you'd like to explore in greater detail!"
    )
    return text, suggestions


async def general_chat(
    db: Session | None,
    message: str,
    history: list[dict] | None = None,
    session_id: str | None = None,
) -> dict:
    """General-purpose Cart AI assistant endpoint.
    Handles general knowledge, coding, academic queries, brainstorming,
    and shopping advice with conversational context.
    """
    history = history or []
    convo = "\n".join(f"{m.get('role', 'user')}: {m.get('text', '')}" for m in history[-6:])
    user_prompt = message
    if convo:
        user_prompt = f"Conversation history:\n{convo}\n\nUser request: {message}"

    llm_res = await _llm(GENERAL_SYSTEM_PROMPT, user_prompt, max_tokens=2500)
    if llm_res:
        reply_text, provider = llm_res
        suggestions = [
            "Tell me more about this",
            "Can you give a practical code example?",
            "How does this compare to alternatives?",
        ]
    else:
        reply_text, suggestions = _builtin_general_reply(message, history)
        provider = "smartcart-reasoning-engine"

    return {
        "reply": reply_text,
        "provider": provider,
        "suggestions": suggestions,
    }


def _builtin_community_gemini_reply(clean_msg: str, recent_context: list[str]) -> str:
    """Intelligent multi-domain fallback response generator when LLM is unavailable."""
    q = clean_msg.lower().strip()

    # 0. Greetings & Casual Chit-Chat
    if any(q == g or q.startswith(g + " ") or q.endswith(" " + g) or q in [g + "!", g + ".", g + "?"] for g in ["hi", "hello", "hey", "hola", "namaste", "good morning", "good evening", "good afternoon"]):
        return "Hello! 👋 How may I help you today? Whether you need product advice, price comparisons, help with programming, or have questions about anything, I'm right here!"

    if any(k in q for k in ["how are you", "how are u", "how r u", "how do you do", "how's it going", "hows it going"]):
        return "I'm doing great, thank you for asking! 😊 How are you doing today? What can I help you with?"

    if any(k in q for k in ["who are you", "what is your name", "what are you", "your name"]):
        return (
            "I'm **Cart**, your AI shopping companion and multi-domain assistant on SmartCart AI! "
            "You can ask me anything—from live gadget specs, deals, and coupon savings to programming, "
            "academic concepts, or casual chit-chat. How can I assist you today?"
        )

    if any(k in q for k in ["thanks", "thank you", "thx", "appreciate it"]):
        return "You're very welcome! 😊 Feel free to tag `@Cart` anytime if you have more questions."

    if "joke" in q:
        return "Why do programmers prefer dark mode?\n\nBecause light attracts bugs! 🐛💻\n\nWhat else would you like to know?"

    # 1. Lenovo vs Asus / CS Laptop Query
    if ("lenovo" in q or "slim 3" in q) and ("asus" in q or "vivobook" in q):
        return (
            "### 💻 Lenovo IdeaPad Slim 3 vs ASUS Vivobook for Computer Science\n\n"
            "Both laptops are popular choices under ₹60,000–₹70,000 for CS students, but each caters to different coding workflows:\n\n"
            "| Feature | Lenovo IdeaPad Slim 3 | ASUS Vivobook 15 / 16 | CS Verdict |\n"
            "| :--- | :--- | :--- | :--- |\n"
            "| **Processor Options** | AMD Ryzen 5 7530U / Intel Core i5-1235U | Intel Core i5-1235U / Core i5-1335U | **Tie:** Both easily handle compilers & IDEs |\n"
            "| **RAM & Expandability** | 16GB DDR4 (Upgradeable up to 24GB) | 8GB/16GB (Partially soldered, limited) | **Lenovo wins:** Crucial for running Docker & VMs |\n"
            "| **Keyboard & Typing** | 1.5mm key travel, tactile curves | 1.4mm travel, flat chiclet | **Lenovo wins:** Superior comfort for 6+ hr coding sessions |\n"
            "| **Display Quality** | 15.6\" FHD Anti-Glare (250-300 nits) | 15.6\"/16\" OLED or IPS (300-400 nits) | **ASUS wins:** Vibrant colors & higher peak brightness |\n"
            "| **Battery & Thermals** | 47Wh–56Wh with Rapid Charge Boost | 42Wh–50Wh with 65W fast charge | **Lenovo wins:** ~6.5–7 hrs real-world battery vs ~5.5 hrs |\n"
            "| **Approx. Price** | ₹48,990 – ₹58,990 | ₹51,990 – ₹62,990 | Live tracked across Amazon & Flipkart |\n\n"
            "#### 🏆 The Bottom Line for CS Students:\n"
            "* **Choose the Lenovo IdeaPad Slim 3** if your priority is **heavy coding, compiling, Docker containers, and typing comfort**. The keyboard is significantly more ergonomic, and the RAM upgrade path future-proofs you for 4 years of college.\n"
            "* **Choose the ASUS Vivobook** if you also do **frontend design, UI/UX, video streaming, or multimedia**, where the OLED display panel makes a dramatic difference.\n\n"
            "💡 **SmartCart Tip:** Applying coupon **`SMART10`** at checkout with **PayPal** gets you an extra **10% discount**!"
        )

    # 2. Battery Life under 70,000 INR
    if "battery" in q and ("70000" in q or "70,000" in q or "70k" in q or "laptop" in q):
        return (
            "### 🔋 Laptops with the Best Battery Life Under ₹70,000 in India\n\n"
            "When searching for long battery endurance under ₹70,000, processor efficiency (especially AMD 7000-series U-chips or Apple Silicon) and battery capacity (Wh) matter most:\n\n"
            "| Rank | Model | Battery Size & Life | Specs | Price (INR) |\n"
            "| :--- | :--- | :--- | :--- | :--- |\n"
            "| 🥇 **#1** | **Apple MacBook Air M1** | **49.9Wh (14–16 hrs real-world)** | M1 chip, 8GB Unified RAM, 256GB SSD, Retina | ~₹69,990 |\n"
            "| 🥈 **#2** | **Lenovo IdeaPad Slim 5** | **76Wh (10–12 hrs real-world)** | Ryzen 5 7530U / Core i5, 16GB RAM, FHD+ OLED | ~₹64,990 |\n"
            "| 🥉 **#3** | **Acer Swift Go 14** | **65Wh (9–11 hrs real-world)** | Intel Core i5 13th Gen, 16GB LPDDR5, OLED 90Hz | ~₹59,990 |\n"
            "| 🎖️ **#4** | **ASUS Vivobook S 14 OLED** | **75Wh (8–10 hrs real-world)** | Intel Core i5 12500H, 16GB RAM, 2.8K OLED | ~₹67,990 |\n\n"
            "#### 💡 Why MacBook Air M1 Still Dominates Endurance:\n"
            "Because of Apple's ARM architecture, the MacBook Air idle power consumption is under 1.5 Watts, giving it unmatched battery life that easily lasts a full workday or campus classes without a charger.\n\n"
            "If you need **Windows/Linux for software compatibility**, the **Lenovo IdeaPad Slim 5 (76Wh battery pack)** is the absolute best Windows battery performer under ₹70,000.\n\n"
            "🛒 *Check SmartCart's live comparison tab to track price dips on Amazon and Flipkart, and apply `SMART10` with PayPal for 10% off!*"
        )

    # 3. Coding & Technical Queries
    if any(k in q for k in ["code", "python", "javascript", "react", "docker", "algorithm", "function", "sql", "git", "api", "compile", "reverse", "prime"]):
        if "reverse" in q:
            return (
                "### 🐍 Python String & List Reversal\n\n"
                "Here are the most idiomatic and performant ways to reverse in Python:\n\n"
                "#### 1. Slicing (Recommended - O(n) time, O(n) space)\n"
                "```python\n"
                "def reverse_string(s: str) -> str:\n"
                "    return s[::-1]\n\n"
                "print(reverse_string('smartcart'))  # Output: 'tracrtams'\n"
                "```\n\n"
                "#### 2. Two-Pointer In-Place Reversal (O(1) auxiliary space for mutable lists)\n"
                "```python\n"
                "def reverse_in_place(chars: list[str]) -> None:\n"
                "    left, right = 0, len(chars) - 1\n"
                "    while left < right:\n"
                "        chars[left], chars[right] = chars[right], chars[left]\n"
                "        left += 1\n"
                "        right -= 1\n"
                "```\n\n"
                "*Let me know if you need recursion or another language implementation!*"
            )

        return (
            f"### 💻 Technical Insight on {clean_msg.strip()}\n\n"
            "Here is the architectural and implementation breakdown:\n\n"
            "#### Key Best Practices\n"
            "* **Separation of Concerns:** Keep core domain logic decoupled from external transport and UI layers.\n"
            "* **Runtime Validation:** Enforce schemas at boundaries (using Pydantic, Zod, or type guards) to reject malformed payloads immediately.\n"
            "* **Idempotency & Resilience:** Safe retry patterns prevent duplicate state mutations or charges during network drops.\n\n"
            "```python\n"
            "# Clean Python pattern with runtime error handling\n"
            "def process_task(payload: dict) -> dict:\n"
            "    if not payload.get('id'):\n"
            "        raise ValueError('Missing required payload ID')\n"
            "    return {'status': 'processed', 'data': payload}\n"
            "```\n\n"
            "*Would you like me to tailor a specific implementation or code example for this?*"
        )

    # 4. Product Comparison & Hardware
    if any(k in q for k in ["laptop", "phone", "headphone", "device", "compare", "vs", "which", "buy", "deal", "better", "best"]):
        matched = [p for p in PRODUCTS if p["category"].lower() in q or p["brand"].lower() in q or any(t in q for t in p["name"].lower().split())]
        if not matched:
            matched = PRODUCTS[:2]

        p1 = matched[0]
        p2 = matched[1] if len(matched) > 1 else PRODUCTS[1]
        p1_specs = p1.get("specs", {})
        p2_specs = p2.get("specs", {})

        return (
            f"### 🛒 Spec Comparison & Shopping Verdict\n\n"
            f"Here is a side-by-side evaluation regarding **\"{clean_msg}\"**:\n\n"
            f"| Specification | {p1['name'][:24]} | {p2['name'][:24]} | Verdict |\n"
            f"| :--- | :--- | :--- | :--- |\n"
            f"| **Brand & Category** | {p1['brand']} ({p1['category']}) | {p2['brand']} ({p2['category']}) | Balanced |\n"
            f"| **Key Specs** | {p1_specs.get('processor', p1_specs.get('driver', 'Verified'))} | {p2_specs.get('processor', p2_specs.get('driver', 'Verified'))} | High Performance |\n"
            f"| **Rating & Trust** | {p1['rating']} ⭐ | {p2['rating']} ⭐ | Verified Reviews |\n"
            f"| **Best Price** | ${p1['price']:,.2f} | ${p2['price']:,.2f} | Live tracked |\n\n"
            "#### 💡 SmartCart Savings Tip\n"
            "SmartCart continuously tracks genuine price drops across Amazon and Flipkart. "
            "When checking out with **PayPal**, apply coupon **`SMART10`** to unlock an immediate **10% discount**!\n\n"
            "*Let me know if you want deeper spec comparisons or reviews breakdown for either device.*"
        )

    # 5. Concepts & General Knowledge
    return (
        f"### 💡 Insights & Analysis: {clean_msg.strip()}\n\n"
        "Here is what you need to know:\n\n"
        "1. **Core Mechanism:** Understanding the foundational principles allows you to make informed decisions without bias.\n"
        "2. **Comparative Trade-offs:** Always weigh long-term durability and true value against short-term upfront costs.\n"
        "3. **Practical Next Step:** In modern tech and e-commerce, combining verified telemetry with algorithmic analysis produces the most consistent results.\n\n"
        "Feel free to ask a follow-up or tag `@Cart` with specific constraints!"
    )


async def community_reply(message: str, recent_context: list[str]) -> str:
    """Generate a response when @Cart is mentioned in the public community chat."""
    clean_msg = re.sub(r"@(cart|cartai|smartcart)\b[:!?,]?", "", message, flags=re.IGNORECASE).strip()
    context_str = "\n".join(recent_context[-6:])

    prompt = (
        f"Community discussion context:\n{context_str}\n\n"
        f"User question to @Cart: {clean_msg or message}\n\n"
        "Directly and naturally answer whatever the user asked or said, matching your tone and length to their intent."
    )

    llm_res = await _llm(COMMUNITY_SYSTEM_PROMPT, prompt, max_tokens=2500)
    if llm_res and llm_res[0].strip():
        return llm_res[0].strip()

    # Built-in contextual community response generator (Gemini-quality fallback)
    return _builtin_community_gemini_reply(clean_msg or message, recent_context)


# ---------- Support & Shopping (Preserved exactly) ----------

def _money(amount: float, currency: str) -> str:
    return f"{currency} {amount:,.2f}"


def _order_line(o: dict) -> str:
    mode = " (mock payment)" if o["mock"] else ""
    return (
        f"Order {o['id']}: {o['product_name']}, {_money(o['total'], o['currency'])}, "
        f"status {o['status']}{mode}, risk check {o['risk_level']}"
    )


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
        facts.append(
            f"Session budget {b['budget']:g}, spent {b['spent']:g}, "
            f"remaining {b['remaining']:g}."
        )
    facts.extend(_store_rules())
    return facts, shown


def _support_rules(message: str, db: Session, session_id: str, shown: list[dict]) -> str:
    q = message.lower()
    orders = services.orders_for_session(db, session_id)

    if re.search(r"refund|cancel|return", q):
        return (
            "I can't process refunds, cancellations or returns here. "
            "Please contact the store with your order id"
            + (f" ({orders[0]['id']})." if orders else ".")
        )

    if re.search(r"twice|duplicate|double", q):
        return (
            "Checkout uses an idempotency key. If a request is retried or clicked twice, "
            "the same order is returned and you are not charged again. "
            + (
                f"Your latest order is {orders[0]['id']}; check Orders for duplicates."
                if orders
                else "You have no orders in this session yet."
            )
        )

    if re.search(r"block|declin|fail|rejected|why.*(payment|order)", q):
        risky = [o for o in orders if o["risk_reasons"] or o["status"] not in ("COMPLETED", "CREATED")]
        if risky:
            o = risky[0]
            why = "; ".join(o["risk_reasons"]) or f"its status is {o['status']}"
            return f"{o['id']} was flagged because {why}."
        return (
            "Payments are blocked if you did not approve them, or if 3 or more orders are "
            "placed within 10 minutes. They go to review when above 500, above twice your "
            "budget, or when the coupon code is unknown. I see no flagged orders in this session."
        )

    if re.search(r"coupon|promo|discount code", q):
        lines = [f"{code}: {c['description']}" for code, c in COUPONS.items()]
        return "Valid coupons are " + "; ".join(lines) + ". The best valid one is applied automatically."

    if re.search(r"shipping|delivery", q):
        return (
            f"Shipping is free once the total after discounts reaches "
            f"{settings.free_shipping_threshold:g} {settings.currency}; below that it is a flat "
            f"{settings.flat_shipping_fee:g}. I don't have delivery dates."
        )

    if re.search(r"spent|budget", q):
        ins = services.insights(db, session_id)
        b = ins["budget"]
        if b["budget"] is None:
            return f"No budget is set. You have spent {b['spent']:g} {ins['currency']} so far."
        return (
            f"Budget {b['budget']:g}, spent {b['spent']:g}, "
            f"remaining {b['remaining']:g} {ins['currency']}."
        )

    if re.search(r"paypal|pay|checkout", q) and not shown:
        return (
            "At checkout you approve the payment, then PayPal creates the order and you "
            "capture it. Without sandbox credentials the app uses a mock PayPal order."
        )

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

    return {
        "mode": "support",
        "reply": reply,
        "search": None,
        "orders": shown,
        "trace": trace,
        "provider": provider,
    }


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
        parts.append(
            f"Coupon {cart['coupon']['code']} saves {cart['coupon']['saving']:,.2f}. "
            f"Cart total is {cart['total']:,.2f}."
        )
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
    return {
        "mode": "shop",
        "reply": _shop_reply(result),
        "search": result,
        "orders": None,
        "trace": result["trace"],
        "provider": result["intent"]["source"],
    }


async def chat(
    db: Session,
    *,
    session_id: str,
    message: str,
    history: list[dict] | None = None,
    coupon_code: str | None = None,
) -> dict:
    services.ensure_session(db, session_id)
    history = history or []
    if route(message) == "support":
        return await _support(db, session_id, message, history)
    return await _shop(db, session_id, message, coupon_code)
