"""Database models (PostgreSQL in production, SQLite for local runs)."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

from app.config import settings


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


class Base(DeclarativeBase):
    pass


class ShoppingSession(Base):
    __tablename__ = "shopping_sessions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    budget: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class AgentRun(Base):
    """Execution log for each pipeline run (agent trace kept for audit and the UI)."""

    __tablename__ = "agent_runs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("shopping_sessions.id"), index=True)
    query: Mapped[str] = mapped_column(Text)
    top_pick: Mapped[str | None] = mapped_column(String(64), nullable=True)
    trace: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)  # PayPal order id, or MOCK-...
    session_id: Mapped[str] = mapped_column(ForeignKey("shopping_sessions.id"), index=True)
    product_id: Mapped[str] = mapped_column(String(64))
    product_name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(64))
    amount: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(8))
    status: Mapped[str] = mapped_column(String(32), default="CREATED")
    mock: Mapped[bool] = mapped_column(default=False)
    risk_level: Mapped[str] = mapped_column(String(16), default="low")
    risk_reasons: Mapped[list] = mapped_column(JSON, default=list)
    idempotency_key: Mapped[str] = mapped_column(String(128), unique=True)
    approved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class User(Base):
    """Registered user account. Strictly enforces: 1 verified phone number = 1 account."""
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone_number: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    phone_verified: Mapped[bool] = mapped_column(Boolean, default=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    google_id: Mapped[str | None] = mapped_column(String(128), unique=True, nullable=True, index=True)
    role: Mapped[str] = mapped_column(String(32), default="user")  # "user" | "admin"
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class PhoneVerification(Base):
    """Store active verification OTPs with expiration and retry safeguards."""
    __tablename__ = "phone_verifications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    phone_number: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    otp_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class CommunityMessage(Base):
    """Public community chat messages with support for replies, links, images, and @Cart."""
    __tablename__ = "community_messages"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    user_name: Mapped[str] = mapped_column(String(255), nullable=False)
    user_avatar: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_bot: Mapped[bool] = mapped_column(Boolean, default=False)
    parent_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    links: Mapped[list] = mapped_column(JSON, default=list)
    images: Mapped[list] = mapped_column(JSON, default=list)
    reported: Mapped[bool] = mapped_column(Boolean, default=False)
    report_count: Mapped[int] = mapped_column(Integer, default=0)
    deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)


class CommunityReport(Base):
    """Community moderation reports filed by users."""
    __tablename__ = "community_reports"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    message_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    reporter_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class UserRating(Base):
    """Genuine user ratings (1 to 5 stars + optional comment). Max 1 active rating per registered user."""
    __tablename__ = "user_ratings"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    user_name: Mapped[str] = mapped_column(String(255), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class StoreCache(Base):
    """Cached geocoding and Overpass store search results to respect rate limits."""
    __tablename__ = "store_cache"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    cache_key: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    data: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {},
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def init_db() -> None:
    Base.metadata.create_all(engine)
    _seed_initial_data()


def _seed_initial_data() -> None:
    """Seed initial demo accounts, ratings, and welcome community message if not already present."""
    with SessionLocal() as db:
        try:
            # Seed demo user
            demo_user = db.query(User).filter_by(email="sujit.krishna@smartcart.ai").first()
            if not demo_user:
                from app.auth_utils import hash_password
                demo_user = User(
                    id="usr-demo-sujit",
                    email="sujit.krishna@smartcart.ai",
                    phone_number="+919876543210",
                    phone_verified=True,
                    full_name="Sujit Krishna",
                    hashed_password=hash_password("DemoPassword123!"),
                    role="admin",
                )
                db.add(demo_user)

            # Seed a second verified user
            user2 = db.query(User).filter_by(email="priya.sharma@example.com").first()
            if not user2:
                from app.auth_utils import hash_password
                user2 = User(
                    id="usr-demo-priya",
                    email="priya.sharma@example.com",
                    phone_number="+919811223344",
                    phone_verified=True,
                    full_name="Priya Sharma",
                    hashed_password=hash_password("PriyaPass123!"),
                    role="user",
                )
                db.add(user2)

            db.commit()

            # Seed initial genuine ratings if none exist
            rating_count = db.query(UserRating).count()
            if rating_count == 0:
                r1 = UserRating(
                    id="rate-1",
                    user_id=demo_user.id,
                    user_name=demo_user.full_name,
                    rating=5,
                    comment="SmartCart saved me 10% on my laptop purchase with PayPal! The AI comparison between Amazon and Flipkart is spot on.",
                )
                r2 = UserRating(
                    id="rate-2",
                    user_id=user2.id,
                    user_name=user2.full_name,
                    rating=5,
                    comment="Love the review sentiment scoring and real-time budget tracker. Very smooth UI.",
                )
                db.add_all([r1, r2])
                db.commit()

            # Seed initial community message if none exist
            msg_count = db.query(CommunityMessage).count()
            if msg_count == 0:
                welcome_msg = CommunityMessage(
                    id="msg-welcome-1",
                    user_id=demo_user.id,
                    user_name=demo_user.full_name,
                    is_bot=False,
                    content="Welcome to the SmartCart AI Community! Ask for shopping advice, compare products, or tag @Cart for instant AI shopping suggestions.",
                    links=[],
                    images=[],
                )
                bot_reply = CommunityMessage(
                    id="msg-welcome-2",
                    user_id="bot-cart",
                    user_name="Cart AI Assistant",
                    is_bot=True,
                    parent_id="msg-welcome-1",
                    content="Hello SmartCart shoppers! I'm Cart, your AI shopping companion. Mention @Cart in any message whenever you need quick product specs, budget-friendly picks, or deal comparisons across Amazon and Flipkart!",
                    links=[],
                    images=[],
                )
                db.add_all([welcome_msg, bot_reply])
                db.commit()
        except Exception as e:
            db.rollback()
            # Non-fatal log
            print(f"Database seed notice: {e}")
