"""Products & Categories API endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_db, optional_user
from app.models.product import Category, Inventory, Product, ProductAttribute, ProductImage
from app.models.user import MerchantProfile, User
from app.schemas.product import CategoryOut, ProductCard, ProductDetail, ProductSearchParams

router = APIRouter(tags=["products"])


def _product_to_card(p: Product) -> dict:
    primary_image = next((img.url for img in p.images if img.is_primary), None)
    if not primary_image and p.images:
        primary_image = p.images[0].url
    return {
        "id": p.id,
        "name": p.name,
        "slug": p.slug,
        "brand": p.brand,
        "price": float(p.price),
        "compare_at_price": float(p.compare_at_price) if p.compare_at_price else None,
        "avg_rating": p.avg_rating,
        "review_count": p.review_count,
        "is_featured": p.is_featured,
        "primary_image": primary_image,
        "category_slug": p.category.slug if p.category else "",
        "merchant": {
            "id": p.merchant.id,
            "store_name": p.merchant.store_name,
            "store_slug": p.merchant.store_slug,
            "logo_url": p.merchant.logo_url,
        },
        "is_in_stock": p.inventory.is_in_stock if p.inventory else False,
    }


def _product_to_detail(p: Product) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "slug": p.slug,
        "description": p.description,
        "brand": p.brand,
        "price": float(p.price),
        "compare_at_price": float(p.compare_at_price) if p.compare_at_price else None,
        "avg_rating": p.avg_rating,
        "review_count": p.review_count,
        "is_featured": p.is_featured,
        "images": [{"id": img.id, "url": img.url, "alt_text": img.alt_text,
                    "sort_order": img.sort_order, "is_primary": img.is_primary}
                   for img in p.images],
        "attributes": [{"key": a.key, "value": a.value, "unit": a.unit} for a in p.attributes],
        "inventory": {
            "quantity": p.inventory.quantity if p.inventory else 0,
            "available_quantity": p.inventory.available_quantity if p.inventory else 0,
            "is_in_stock": p.inventory.is_in_stock if p.inventory else False,
            "is_low_stock": p.inventory.is_low_stock if p.inventory else False,
            "low_stock_threshold": p.inventory.low_stock_threshold if p.inventory else 5,
        } if p.inventory else None,
        "category": {
            "id": p.category.id,
            "name": p.category.name,
            "slug": p.category.slug,
            "description": p.category.description,
            "icon": p.category.icon,
            "sort_order": p.category.sort_order,
        },
        "merchant": {
            "id": p.merchant.id,
            "store_name": p.merchant.store_name,
            "store_slug": p.merchant.store_slug,
            "logo_url": p.merchant.logo_url,
        },
        "created_at": p.created_at.isoformat(),
    }


def _base_query(db: Session):
    return (
        db.query(Product)
        .options(
            joinedload(Product.images),
            joinedload(Product.attributes),
            joinedload(Product.inventory),
            joinedload(Product.category),
            joinedload(Product.merchant),
        )
        .filter(Product.is_active == True)
    )


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)) -> list:
    return db.query(Category).order_by(Category.sort_order).all()


@router.get("/products")
def list_products(
    q: str | None = Query(default=None),
    category: str | None = Query(default=None),
    merchant: str | None = Query(default=None),
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    in_stock: bool | None = Query(default=None),
    featured: bool | None = Query(default=None),
    sort: str = Query(default="relevance"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> dict:
    query = _base_query(db)

    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(
                Product.name.ilike(search),
                Product.description.ilike(search),
                Product.brand.ilike(search),
            )
        )
    if category:
        query = query.join(Category, Product.category_id == Category.id).filter(
            Category.slug == category)
    if merchant:
        query = query.join(MerchantProfile, Product.merchant_id == MerchantProfile.id).filter(
            MerchantProfile.store_slug == merchant)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if featured is not None:
        query = query.filter(Product.is_featured == featured)
    if in_stock is True:
        query = query.join(Inventory, Product.id == Inventory.product_id).filter(
            Inventory.quantity > Inventory.reserved_quantity)

    # Sorting
    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort == "rating":
        query = query.order_by(Product.avg_rating.desc())
    elif sort == "newest":
        query = query.order_by(Product.created_at.desc())
    else:
        # relevance: featured first, then rating
        query = query.order_by(Product.is_featured.desc(), Product.avg_rating.desc())

    total = query.count()
    products = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "items": [_product_to_card(p) for p in products],
    }


@router.get("/products/featured")
def featured_products(limit: int = Query(default=8, le=20), db: Session = Depends(get_db)) -> list:
    products = (
        _base_query(db)
        .filter(Product.is_featured == True)
        .order_by(Product.avg_rating.desc())
        .limit(limit)
        .all()
    )
    return [_product_to_card(p) for p in products]


@router.get("/products/{product_id_or_slug}")
def get_product(product_id_or_slug: str, db: Session = Depends(get_db)) -> dict:
    q = _base_query(db)
    # Try by ID first, then by slug
    product = q.filter(
        or_(Product.id == product_id_or_slug, Product.slug == product_id_or_slug)
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return _product_to_detail(product)


@router.get("/merchants")
def list_merchants(db: Session = Depends(get_db)) -> list:
    merchants = (
        db.query(MerchantProfile)
        .filter(MerchantProfile.status == "approved")
        .all()
    )
    return [
        {
            "id": m.id,
            "store_name": m.store_name,
            "store_slug": m.store_slug,
            "description": m.description,
            "logo_url": m.logo_url,
            "banner_url": m.banner_url,
            "product_count": len([p for p in m.products if p.is_active]),
        }
        for m in merchants
    ]


@router.get("/merchants/{slug}")
def get_merchant(slug: str, db: Session = Depends(get_db)) -> dict:
    merchant = db.query(MerchantProfile).filter(
        MerchantProfile.store_slug == slug,
        MerchantProfile.status == "approved"
    ).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    products = (
        _base_query(db)
        .filter(Product.merchant_id == merchant.id)
        .order_by(Product.is_featured.desc(), Product.avg_rating.desc())
        .all()
    )
    return {
        "id": merchant.id,
        "store_name": merchant.store_name,
        "store_slug": merchant.store_slug,
        "description": merchant.description,
        "logo_url": merchant.logo_url,
        "banner_url": merchant.banner_url,
        "products": [_product_to_card(p) for p in products],
    }
