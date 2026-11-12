"""SmartCart AI API (FastAPI).

Local run:
    uvicorn app.main:app --reload --port 8000
Interactive docs: http://localhost:8000/docs
"""

from __future__ import annotations

from collections.abc import Iterator
from pathlib import Path

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app import assistant, auth_router, community_router, paypal, services, stats_router, stores_router
from app.catalog import PRODUCTS
from app.config import settings
from app.db import SessionLocal, init_db
from app.graph import run_pipeline


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app = FastAPI(title="SmartCart AI", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory is created and mounted for community image attachments
upload_path = Path("uploads")
upload_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_path)), name="uploads")

# Include modular feature routers
app.include_router(auth_router.router)
app.include_router(community_router.router)
app.include_router(stores_router.router)
app.include_router(stats_router.router)


@app.on_event("startup")
def _startup() -> None:
    init_db()


# ---------- Schemas ----------

class SearchRequest(BaseModel):
    session_id: str = Field(min_length=8, max_length=64)
    query: str = Field(min_length=2, max_length=500)
    coupon_code: str | None = None


class BudgetRequest(BaseModel):
    budget: float | None = Field(default=None, ge=0)


class CreateOrderRequest(BaseModel):
    session_id: str = Field(min_length=8, max_length=64)
    product_id: str | None = None
    product_ids: list[str] | None = None
    coupon_code: str | None = None
    approved: bool = False  # the shopper must explicitly approve the payment


class CaptureRequest(BaseModel):
    order_id: str


class ChatTurn(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    text: str = Field(max_length=2000)


class ChatRequest(BaseModel):
    session_id: str = Field(min_length=8, max_length=64)
    message: str = Field(min_length=1, max_length=1000)
    history: list[ChatTurn] = Field(default_factory=list, max_length=20)
    coupon_code: str | None = None


class GeneralChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatTurn] = Field(default_factory=list, max_length=20)
    session_id: str | None = None


# ---------- Routes ----------

@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "paypal_configured": paypal.is_configured(),
        "version": app.version,
        "live_feed": {
            "enabled": bool(settings.serpapi_api_key),
            "provider": "serpapi" if settings.serpapi_api_key else "local_catalog",
        },
    }


@app.get("/api/products")
def products() -> list[dict]:
    return PRODUCTS


@app.put("/api/sessions/{session_id}/budget")
def update_budget(session_id: str, body: BudgetRequest, db: Session = Depends(get_db)) -> dict:
    shopping = services.set_budget(db, session_id, body.budget)
    return {"session_id": session_id, "budget": shopping.budget}


@app.post("/api/search")
async def search(req: SearchRequest, db: Session = Depends(get_db)) -> dict:
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query is empty")
    services.ensure_session(db, req.session_id)
    shopping = db.get(services.ShoppingSession, req.session_id)
    result = await run_pipeline(
        req.query.strip(),
        coupon_code=req.coupon_code,
        session_budget=shopping.budget,
        spent_so_far=services.spent_so_far(db, req.session_id),
    )
    services.record_run(db, req.session_id, req.query.strip(), result)
    return result


@app.post("/api/assistant/chat")
async def assistant_chat(req: ChatRequest, db: Session = Depends(get_db)) -> dict:
    """Shopping help (runs the agent pipeline) and order/checkout support in one endpoint."""
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message is empty")
    return await assistant.chat(
        db,
        session_id=req.session_id,
        message=req.message.strip(),
        history=[t.model_dump() for t in req.history],
        coupon_code=req.coupon_code,
    )


@app.post("/api/assistant/general-chat")
async def assistant_general_chat(req: GeneralChatRequest, db: Session = Depends(get_db)) -> dict:
    """Dedicated general-purpose chatbot interface for Cart AI.
    Handles general knowledge, coding, technical concepts, academic questions, and shopping advice.
    """
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message is empty")
    return await assistant.general_chat(
        db,
        message=req.message.strip(),
        history=[t.model_dump() for t in req.history],
        session_id=req.session_id,
    )


@app.post("/api/checkout/create-order", status_code=201)
async def create_order(
    req: CreateOrderRequest,
    db: Session = Depends(get_db),
    idempotency_key: str = Header(..., alias="Idempotency-Key", min_length=8, max_length=128),
) -> dict:
    try:
        return await services.create_checkout(
            db,
            session_id=req.session_id,
            product_id=req.product_id,
            product_ids=req.product_ids,
            coupon_code=req.coupon_code,
            approved=req.approved,
            idempotency_key=idempotency_key,
        )
    except services.NotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except services.CheckoutBlocked as exc:
        raise HTTPException(status_code=403, detail={"message": "Payment blocked", "reasons": exc.reasons})


@app.post("/api/checkout/capture")
async def capture(req: CaptureRequest, db: Session = Depends(get_db)) -> dict:
    try:
        return await services.capture(db, req.order_id)
    except services.NotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.post("/api/webhooks/paypal")
async def paypal_webhook(request: Request, db: Session = Depends(get_db)) -> dict:
    event = await request.json()
    if not await paypal.verify_webhook(dict(request.headers), event):
        raise HTTPException(status_code=401, detail="Webhook signature not verified")

    if event.get("event_type") == "PAYMENT.CAPTURE.COMPLETED":
        related = event.get("resource", {}).get("supplementary_data", {}).get("related_ids", {})
        order_id = related.get("order_id")
        if order_id:
            services.mark_completed(db, order_id)
    return {"received": True}


@app.get("/api/sessions/{session_id}/insights")
def session_insights(session_id: str, db: Session = Depends(get_db)) -> dict:
    return services.insights(db, session_id)


@app.get("/api/sessions/{session_id}/orders")
def session_orders(session_id: str, db: Session = Depends(get_db)) -> list[dict]:
    return services.orders_for_session(db, session_id)
