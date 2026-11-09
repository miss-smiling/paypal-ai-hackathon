"""Authentication endpoints."""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user, get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import CustomerProfile, MerchantProfile, User
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    MerchantRegisterRequest,
    ProfileUpdateRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _make_slug(store_name: str) -> str:
    import re
    slug = store_name.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug).strip("-")
    return slug


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=req.email,
        full_name=req.full_name,
        hashed_password=hash_password(req.password),
        role="customer",
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.flush()
    db.add(CustomerProfile(user_id=user.id))
    db.commit()
    return TokenResponse(
        access_token=create_access_token(user.id, user.role),
        refresh_token=create_refresh_token(user.id),
        role=user.role,
    )


@router.post("/register/merchant", response_model=dict, status_code=status.HTTP_201_CREATED)
def register_merchant(req: MerchantRegisterRequest, db: Session = Depends(get_db)) -> dict:
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    slug = req.store_slug or _make_slug(req.store_name)
    if db.query(MerchantProfile).filter(MerchantProfile.store_slug == slug).first():
        raise HTTPException(status_code=400, detail="Store slug already taken")
    user = User(
        email=req.email,
        full_name=req.full_name,
        hashed_password=hash_password(req.password),
        role="merchant",
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.flush()
    db.add(MerchantProfile(
        user_id=user.id,
        store_name=req.store_name,
        store_slug=slug,
        description=req.description,
        phone=req.phone,
        status="pending",
    ))
    db.commit()
    return {"message": "Merchant registered. Pending admin approval.", "store_slug": slug}


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")

    # For merchants, attach merchant_id claim
    merchant_id = None
    if user.role == "merchant" and user.merchant_profile:
        if user.merchant_profile.status != "approved":
            raise HTTPException(status_code=403, detail="Merchant account pending approval")
        merchant_id = user.merchant_profile.id

    return TokenResponse(
        access_token=create_access_token(user.id, user.role, merchant_id),
        refresh_token=create_refresh_token(user.id),
        role=user.role,
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(req: RefreshRequest, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        payload = decode_token(req.refresh_token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Not a refresh token")
    user = db.get(User, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")
    merchant_id = None
    if user.role == "merchant" and user.merchant_profile:
        merchant_id = user.merchant_profile.id
    return TokenResponse(
        access_token=create_access_token(user.id, user.role, merchant_id),
        refresh_token=create_refresh_token(user.id),
        role=user.role,
    )


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.patch("/me", response_model=UserOut)
def update_profile(
    req: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    if req.full_name:
        user.full_name = req.full_name
    if req.phone is not None and user.customer_profile:
        user.customer_profile.phone = req.phone
    db.commit()
    return user


@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    if not verify_password(req.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password incorrect")
    user.hashed_password = hash_password(req.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
