"""FastAPI dependency injection: DB session, current user, role guards."""
from __future__ import annotations

from collections.abc import Iterator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.database.session import SessionLocal
from app.models.user import User

bearer = HTTPBearer(auto_error=False)


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Not authenticated")
    try:
        payload = decode_token(credentials.credentials)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid or expired token")
    user = db.get(User, payload["sub"])
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="User not found or inactive")
    return user


def get_current_user(user: User = Depends(_get_current_user)) -> User:
    return user


def require_customer(user: User = Depends(get_current_user)) -> User:
    if user.role not in ("customer", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customers only")
    return user


def require_merchant(user: User = Depends(get_current_user)) -> User:
    if user.role not in ("merchant", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Merchants only")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins only")
    return user


def optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User | None:
    """Returns user if authenticated, None if no token provided."""
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        return db.get(User, payload["sub"])
    except (ValueError, Exception):
        return None
