# SmartCart AI: Devpost Submission

Use this text for the Devpost project page. Items in [brackets] must be filled in before submitting.

## Project name
SmartCart AI

## Tagline
An agentic shopping assistant that finds, verifies and optimizes your cart, then checks out with PayPal.

## Inspiration
Online shoppers face information overload: conflicting reviews, changing prices, misleading promotions, and tab-switching across stores. We wanted shopping to start with a sentence ("Find a 65W GaN charger under $40") and end with one verified payment.

## What it does
- **Understands plain language.** A shopper describes what they need, their budget and specs. An intent agent turns this into structured constraints.
- **Searches and compares.** A discovery agent filters products by category, budget and specs, and a decision matrix ranks them by spec match, verified-review trust and value. Sponsored placement is not a factor.
- **Removes fake reviews.** A review agent flags duplicate and unverified five-star reviews and scores trust from 0 to 100.
- **Builds the cart.** A price agent applies the best valid coupon. The cart shows subtotal, discount, shipping and total.
- **Manages budget.** Each session tracks spend against a budget. If the top pick is over budget, the app suggests cheaper alternatives.
- **Checks risk before payment.** The shopper must explicitly approve each payment. The backend also blocks suspicious patterns, such as more than three orders in ten minutes.
- **Checks out with PayPal.** Payment uses the PayPal Orders v2 REST API in the Sandbox. Requests are idempotent, so a retry never charges twice. Webhooks are verified before order status changes.

## How it uses PayPal
- PayPal Orders v2 (`POST /v2/checkout/orders`) creates the order, with a `PayPal-Request-Id` set to our idempotency key.
- The shopper approves the payment in PayPal's approval window.
- Capture (`POST /v2/checkout/orders/{id}/capture`) completes the payment.
- The webhook endpoint verifies `PAYMENT.CAPTURE.COMPLETED` with PayPal's signature-verification API before marking an order complete.
- Environment: PayPal **Sandbox**. No real money moves.

[TO VERIFY before submitting: a live sandbox checkout completed end to end, with a screenshot of the order in the PayPal Sandbox dashboard.]

## How it uses AI
- **Gemini** (or OpenAI as a fallback) converts natural language into structured JSON: category, budget and specification constraints.
- **LangGraph** runs the multi-agent workflow. Review and budget agents run in parallel after discovery and join at the optimizer. Every run saves an agent trace to the database for audit.
- If no AI key is set, a rule-based parser keeps the app working.

[TO VERIFY before submitting: a live Gemini call, confirmed in the agent trace.]

## Tech stack
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Python 3.12, FastAPI, LangGraph, SQLAlchemy
- **Database:** PostgreSQL (Neon) in production, SQLite locally
- **AI:** Google Gemini, OpenAI (fallback)
- **Payments:** PayPal REST API (Orders v2, Sandbox)
- **Hosting:** Render (API), Vercel (web app). Render is used as a sponsor tool.

## Challenges
- Keeping payments safe. Every checkout needs explicit approval, a unique idempotency key, and a risk check. Webhooks are verified before any order is marked complete.
- Making the review agent useful without real data. We built a demo catalog with deliberately suspicious reviews so the trust scoring can be seen working.

## Accomplishments
- A complete path from natural-language search to a PayPal sandbox order, with an agent trace the judges can read.
- 19 automated backend tests, covering checkout approval, idempotency, velocity checks, coupons, budget alternatives and webhook rejection.

## What we learned
Agentic commerce is mostly about guardrails. Letting an agent pick products is easy. Making sure it never spends money the shopper didn't approve is the hard part.

## What's next
- Replace the demo catalog with live retail and coupon feeds.
- Add embeddings-based discovery with pgvector.
- Add Redis for session caching.

## Testing instructions for judges
The app is free to test until the judging period ends.

1. **Hosted demo (fastest):** [HOSTED URL: web app]. No setup needed.
2. **Local run:** follow the Quickstart in the README (about 5 minutes). Runs without any API keys.
3. **PayPal sandbox login:** [SANDBOX BUYER ACCOUNT EMAIL AND PASSWORD, provided in this form, not in the repo].
4. **Suggested test flow:**
   - Search: "Find ANC headphones under $250 with 30h battery".
   - Review the agent activity, the decision matrix and the trust scores.
   - Set a session budget of 150 and search again to see cheaper alternatives.
   - Tick the approval checkbox, click "Pay with PayPal", and approve in the sandbox window.
   - Check the order under "Budget and spending".

## Links
- Repository: https://github.com/varshahikity/paypal-ai-hackathon (MIT license)
- Demo video: [YOUTUBE URL, public, under 3 minutes]
- Hosted demo: [URL]

## Submission checklist (internal, do not paste into Devpost)
- [ ] Live PayPal sandbox checkout completed and screenshotted
- [ ] Live Gemini call confirmed in the agent trace
- [ ] LICENSE file pushed and showing in the GitHub About section
- [ ] Hosted URL works from a private browser window
- [ ] Demo video under 3 minutes, public on YouTube
- [ ] Sandbox credentials entered in the Devpost form (not in the repo)
- [ ] Project created or significantly updated between Oct 1 and Nov 12, 2026
- [ ] Submitted before Nov 12, 2026, 12:00 PM Pacific
