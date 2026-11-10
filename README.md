<p align="center">
  <img src="assets/hero-banner.svg" alt="SmartCart AI - Your Intelligent Shopping Companion" width="100%">
</p>

<p align="center">
  <strong>An autonomous multi-agent commerce platform transforming conversational search into verified discoveries, real-time value comparisons, and optimized shopping carts.</strong>
</p>

<p align="center">
  🌐 <strong>English:</strong> <em>Technology For Life · Upgrade Your World</em><br>
  🇮🇳 <strong>हिन्दी (Hindi):</strong> <em>जीवन के लिए तकनीक · अपनी दुनिया को अपग्रेड करें</em><br>
  🇮🇳 <strong>ಕನ್ನಡ (Kannada):</strong> <em>ಜೀವನಕ್ಕಾಗಿ ತಂತ್ರಜ್ಞಾನ · ನಿಮ್ಮ ಜಗತ್ತನ್ನು ನವೀಕರಿಸಿ</em><br>
  🇮🇳 <strong>বাংলা (Bengali):</strong> <em>জীবনের জন্য প্রযুক্তি · আপনার বিশ্বকে আপগ্রেড করুন</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Working%20MVP-059669?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/PayPal%20Hackathon-2026-003087?style=for-the-badge&logo=paypal&logoColor=white" alt="PayPal AI Hackathon">
  <img src="https://img.shields.io/badge/Agents-LangGraph-7C3AED?style=for-the-badge" alt="LangGraph">
  <img src="https://img.shields.io/badge/License-MIT-059669?style=for-the-badge" alt="License">
</p>

---

## Table of contents

- [Executive summary](#executive-summary)
- [For judges](#for-judges)
- [What works today](#what-works-today)
- [Architecture](#architecture)
- [Quickstart (local)](#quickstart-local)
- [Team setup and secrets](#team-setup-and-secrets)
- [API reference](#api-reference)
- [Deployment](#deployment)
- [Project structure](#project-structure)
- [Roadmap](#roadmap)
- [Privacy and responsible AI](#privacy-security--responsible-ai)
- [License](#license)

---

## Executive summary

Online shoppers are overwhelmed by information overload: conflicting reviews, volatile pricing, deceptive promotions, and tedious tab-switching across stores.

**SmartCart AI** reimagines e-commerce through agentic commerce. Users describe what they want, their budget, and constraints in plain language. A LangGraph workflow of specialist agents parses the request, discovers matching products, scores review trust, finds coupons, checks the budget, and optimizes the cart. The shopper then approves the payment and checks out through PayPal.

## For judges

- **Hosted demo:** [HOSTED URL]. No setup needed.
- **Demo video (under 3 minutes):** [YOUTUBE URL]
- **Run locally in about 5 minutes:** follow the Quickstart below. It runs without any API keys.
- **PayPal sandbox login:** provided in the Devpost submission form, not in this repository.
- **Suggested test:** search "ANC headphones under $250 with 30h battery", review the agent activity and decision matrix, set a budget of 150 and search again, then approve and pay in the sandbox.
- **Submission text and checklist:** see [`docs/SUBMISSION.md`](docs/SUBMISSION.md). The demo script is in [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md).

## What works today

- **Natural-language search.** Gemini or OpenAI parses the request when a key is set. Otherwise a rule-based parser handles it, so the app runs with no keys.
- **Multi-agent pipeline (LangGraph).** Intent, discovery, review trust, budget and optimizer agents run as a graph. Review and budget agents run in parallel. Every run writes an agent trace to the database.
- **Decision matrix.** Products are ranked by spec match, verified-review trust and value, not by sponsored placement.
- **Review sentiment guard.** Duplicate and unverified five-star reviews are removed before trust is scored.
- **Coupons and cart pricing.** The best valid coupon is applied and shipping is calculated.
- **Budget intelligence.** Per-session budget tracking. If the top pick is over the remaining budget, cheaper alternatives are suggested.
- **Fraud and risk checks.** Payments are blocked without explicit shopper approval, on velocity abuse (three or more orders in ten minutes), and when a payment is far beyond budget or uses an unknown coupon.
- **Idempotent checkout.** Every order requires an `Idempotency-Key` header. Retries return the same order instead of charging twice.
- **PayPal Orders v2 (Sandbox).** Create, capture and webhook handling. Runs in mock mode until sandbox credentials are set.
- **Insights.** Spend by category, budget used, orders and search history per session.

> [!NOTE]
> PayPal Sandbox and Gemini are implemented but need team credentials to run live. Without them the app uses mock checkout and rule-based parsing, which is fully testable.

## Architecture

The layers below match the team's design. The "as built" column notes where the MVP differs.

| Layer | Planned | As built |
|---|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind | Same (Next 16, React 19, Tailwind 3) |
| Backend | Python, FastAPI | Same |
| Agents | LangGraph | Same (`app/graph.py`) |
| Database | PostgreSQL (Neon) | SQLAlchemy. PostgreSQL in production, SQLite locally |
| LLM | Gemini / OpenAI | Gemini first, OpenAI fallback, rules last |
| Payments | PayPal REST API | PayPal Orders v2 (Sandbox), mock mode without credentials |
| Discovery | Vector search (pgvector / Qdrant) | Spec-based matching over a demo catalog. Embeddings are a later step |
| Cache | Redis | Not used yet. Session state lives in the database |
| Hosting | Vercel + Render | `render.yaml` included. Frontend deploys to Vercel |

The end-to-end flow is in [`assets/workflow-flowchart.svg`](assets/workflow-flowchart.svg). The service layout is in [`assets/system-architecture.svg`](assets/system-architecture.svg). The agent message order is in [`assets/agent-interaction.svg`](assets/agent-interaction.svg).

## Quickstart (local)

You need **Python 3.11 or 3.12** and **Node.js 20.9+**.

**1. Backend**

```bash
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # optional: leave the defaults to run in demo mode
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

**2. Frontend** (new terminal)

```bash
cd frontend
npm install
cp .env.example .env.local         # points the UI at http://localhost:8000
npm run dev
```

Open http://localhost:3000.

**3. Tests**

```bash
# from the project root, with the venv active
pytest -q
```

## Team setup and secrets

API keys and PayPal Sandbox credentials are shared privately by the team lead. They are never committed.

1. Get the shared values from the team lead.
2. Add them to your local `.env` (copied from `.env.example`).
3. Never commit `.env`. It is listed in `.gitignore`.

Variables: `GEMINI_API_KEY`, `OPENAI_API_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `DATABASE_URL`.

## API reference

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Status and whether PayPal is configured |
| GET | `/api/products` | Demo catalog |
| PUT | `/api/sessions/{id}/budget` | Set the session budget (`{"budget": 150}`) |
| POST | `/api/search` | `{session_id, query, coupon_code}`. Returns intent, budget, matrix, cart, alternatives, agent trace |
| POST | `/api/checkout/create-order` | Header `Idempotency-Key`. Body `{session_id, product_id, coupon_code, approved}`. Returns 403 with reasons if blocked |
| POST | `/api/checkout/capture` | `{order_id}`. Captures the approved payment |
| POST | `/api/webhooks/paypal` | Receives `PAYMENT.CAPTURE.COMPLETED` after signature verification |
| GET | `/api/sessions/{id}/insights` | Spend, budget and search stats |
| GET | `/api/sessions/{id}/orders` | Order history |

## Deployment

**Database (Neon).** Create a project at neon.tech and copy the connection string. Use the `postgresql+psycopg://` prefix, for example `postgresql+psycopg://user:pass@host/db?sslmode=require`.

**Backend (Render).** Render → New → Blueprint → connect this repo. Fill in the variables marked `sync: false` in the dashboard, including `DATABASE_URL`, `ALLOWED_ORIGINS` (your Vercel URL) and the PayPal values. The health check is `/api/health`.

**Frontend (Vercel).** Import the repo, set the root directory to `frontend`, and add `NEXT_PUBLIC_API_URL` set to your Render URL.

**PayPal webhook.** In the PayPal developer dashboard, add a webhook pointing to `https://<your-render-url>/api/webhooks/paypal` for `PAYMENT.CAPTURE.COMPLETED`. Put its ID in `PAYPAL_WEBHOOK_ID`.

## Project structure

```
app/
  main.py          FastAPI routes and CORS
  graph.py         LangGraph multi-agent pipeline
  intent.py        Intent agent (Gemini, OpenAI or rules)
  agents.py        Discovery, review, coupon, budget and fraud logic
  cart.py          Ranking and cart pricing
  services.py      Checkout, capture, idempotency and insights
  paypal.py        PayPal Orders v2 and webhook verification
  db.py            SQLAlchemy models (sessions, agent runs, orders)
  catalog.py       Demo catalog, reviews and coupons
  config.py        Settings from environment variables
frontend/          Next.js + TypeScript + Tailwind UI
tests/             Pytest suite (backend)
assets/            Design diagrams and hero images
render.yaml        Render deployment blueprint
```

## Roadmap

- [x] **Phase 1: Problem definition and architecture.** Pain points, agent specs, workflow and architecture diagrams, visual identity.
- [x] **Phase 2: Agent engine and catalog.** LangGraph pipeline, intent parsing, discovery, mock catalog.
- [x] **Phase 3: Conversational frontend.** Next.js UI with agent trace, decision matrix and cart.
- [x] **Phase 4: Cart optimization.** Review trust scoring, coupons, budget intelligence, cheaper alternatives.
- [x] **Phase 5: PayPal integration.** Orders v2 create and capture, idempotency, approval, webhook verification. Live sandbox test needs team credentials.
- [ ] **Phase 6: Verification and submission.** Live sandbox checkout test, Gemini live test, hosted deployment, demo video, Devpost submission (see `docs/SUBMISSION.md`).

## Privacy and responsible AI

- **Unbiased ranking.** Scores come from spec match, trust and value. Nothing is sponsored.
- **Data minimization.** Search needs no account. Sessions use an anonymous ID.
- **Secure payments.** Card details never touch SmartCart servers. Payment runs through PayPal.
- **Explicit approval.** The backend refuses to create a payment unless the shopper approved it.
- **Deceptive content filtering.** Duplicate and unverified five-star reviews are removed before trust is scored.

## License

MIT. See the LICENSE file.

---

<p align="center">
  <sub>Built for the <strong>PayPal AI Hackathon 2026</strong>. Reimagining commerce through intelligent multi-agent orchestration.</sub>
</p>
