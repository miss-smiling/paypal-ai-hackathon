"""Cart, Order, Checkout Pydantic schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


# ── Cart ──────────────────────────────────────────────────────────────────────

class CartItemProduct(BaseModel):
    id: str
    name: str
    slug: str
    price: float
    primary_image: str | None
    merchant_name: str
    merchant_id: str
    is_in_stock: bool

    model_config = {"from_attributes": True}


class CartItemOut(BaseModel):
    id: str
    product: CartItemProduct
    quantity: int
    unit_price: float
    total_price: float

    model_config = {"from_attributes": True}


class CartOut(BaseModel):
    id: str
    items: list[CartItemOut]
    coupon_code: str | None
    item_count: int
    subtotal: float
    discount: float
    shipping: float
    total: float
    currency: str

    model_config = {"from_attributes": True}


class AddToCartRequest(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1, le=100)


class UpdateCartItemRequest(BaseModel):
    quantity: int = Field(ge=1, le=100)


class ApplyCouponRequest(BaseModel):
    coupon_code: str = Field(min_length=1, max_length=50)


# ── Address ───────────────────────────────────────────────────────────────────

class AddressOut(BaseModel):
    id: str
    label: str
    full_name: str
    phone: str
    line1: str
    line2: str | None
    city: str
    state: str
    postal_code: str
    country: str
    is_default: bool

    model_config = {"from_attributes": True}


class AddressCreate(BaseModel):
    label: str = Field(default="Home", max_length=50)
    full_name: str = Field(min_length=2, max_length=255)
    phone: str = Field(min_length=10, max_length=20)
    line1: str = Field(min_length=5, max_length=255)
    line2: str | None = None
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    postal_code: str = Field(min_length=4, max_length=20)
    country: str = Field(default="India", max_length=100)
    is_default: bool = False


# ── Checkout / Orders ─────────────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    address_id: str
    coupon_code: str | None = None
    approved: bool = False  # Customer must explicitly approve
    idempotency_key: str = Field(min_length=8, max_length=128)


class OrderItemOut(BaseModel):
    id: str
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    total_price: float

    model_config = {"from_attributes": True}


class MerchantOrderOut(BaseModel):
    id: str
    merchant_id: str
    merchant_name: str
    status: str
    subtotal: float
    items: list[OrderItemOut]
    tracking_number: str | None
    tracking_url: str | None
    shipped_at: datetime | None
    delivered_at: datetime | None

    model_config = {"from_attributes": True}


class PaymentOut(BaseModel):
    id: str
    paypal_order_id: str | None
    amount: float
    currency: str
    status: str
    is_mock: bool
    approve_url: str | None

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: str
    status: str
    subtotal: float
    discount: float
    shipping: float
    total: float
    currency: str
    coupon_code: str | None
    items: list[OrderItemOut]
    merchant_orders: list[MerchantOrderOut]
    payment: PaymentOut | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CaptureRequest(BaseModel):
    paypal_order_id: str


class MerchantOrderUpdateRequest(BaseModel):
    status: str = Field(pattern=r"^(confirmed|processing|shipped|delivered|cancelled)$")
    tracking_number: str | None = None
    tracking_url: str | None = None
    fulfillment_notes: str | None = None


# ── Wishlist ──────────────────────────────────────────────────────────────────

class WishlistItemOut(BaseModel):
    id: str
    product_id: str
    product_name: str
    product_price: float
    product_image: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
