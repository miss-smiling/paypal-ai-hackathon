"""Database initialization and table creation."""
from __future__ import annotations

from app.database.session import engine
from app.models.base import Base
import app.models  # noqa: F401 — registers all models


def init_db() -> None:
    """Create all tables."""
    Base.metadata.create_all(engine)
