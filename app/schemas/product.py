"""Product-related Pydantic schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class CategoryOut(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None
    icon: str | None
    sort_order: int

    model_config = {"from_attributes": True}


class ProductImageOut(BaseModel):
    id: str
    url: str
    alt_text: str | None
    sort_order: int
    is_primary: bool

    model_config = {"from_attributes": True}


class ProductAttributeOut(BaseModel):
    key: str
    value: str
    unit: str | None

    model_config = {"from_attributes": True}


class InventoryOut(BaseModel):
    quantity: int
    available_quantity: int
    is_in_stock: bool
    is_low_stock: bool
    low_stock_threshold: int

    model_config = {"from_attributes": True}


class MerchantSummary(BaseModel):
    id: str
    store_name: str
    store_slug: str
    logo_url: str | None

    model_config = {"from_attributes": True}


class ProductCard(BaseModel):
    """Minimal product info for catalogue listing."""
    id: str
    name: str
    slug: str
    brand: str | None
    price: float
    compare_at_price: float | None
    avg_rating: float
    review_count: int
    is_featured: bool
    primary_image: str | None
    category_slug: str
    merchant: MerchantSummary
    is_in_stock: bool

    model_config = {"from_attributes": True}


class ProductDetail(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None
    brand: str | None
    price: float
    compare_at_price: float | None
    avg_rating: float
    review_count: int
    is_featured: bool
    images: list[ProductImageOut]
    attributes: list[ProductAttributeOut]
    inventory: InventoryOut | None
    category: CategoryOut
    merchant: MerchantSummary
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductCreate(BaseModel):
    category_id: str
    name: str = Field(min_length=2, max_length=255)
    description: str | None = None
    brand: str | None = None
    sku: str | None = None
    price: float = Field(gt=0)
    compare_at_price: float | None = None
    is_featured: bool = False
    stock: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=5, ge=0)
    attributes: list[dict] = Field(default_factory=list)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    price: float | None = Field(default=None, gt=0)
    compare_at_price: float | None = None
    is_featured: bool | None = None
    is_active: bool | None = None


class ProductSearchParams(BaseModel):
    q: str | None = None
    category: str | None = None
    merchant: str | None = None
    min_price: float | None = Field(default=None, ge=0)
    max_price: float | None = Field(default=None, ge=0)
    in_stock: bool | None = None
    featured: bool | None = None
    sort: str = "relevance"  # relevance | price_asc | price_desc | rating | newest
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class ReviewOut(BaseModel):
    id: str
    user_id: str
    user_name: str
    rating: int
    title: str | None
    body: str | None
    is_verified: bool
    helpful_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(ge=1, le=5)
    title: str | None = None
    body: str | None = Field(default=None, max_length=2000)
