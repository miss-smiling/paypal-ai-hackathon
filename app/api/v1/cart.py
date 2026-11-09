"""Cart API endpoints."""
from __future__ import annotations

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.core.deps import get_db, require_customer
from app.models.order import Cart, CartItem
from app.models.product import Inventory, Product
from app.models.user import User
from app.schemas.order import AddToCartRequest, ApplyCouponRequest, UpdateCartItemRequest

router = APIRouter(prefix="/cart", tags=["cart"])

COUPONS = {
    "SAVE10": {"percent": 10, "min_spend": 500, "description": "10% off orders over ₹500"},
    "FLAT100": {"amount": 100, "min_spend": 1000, "description": "₹100 off orders over ₹1000"},
    "TECH200": {"amount": 200, "min_spend": 2000, "category": "electronics",
                "description": "₹200 off electronics over ₹2000"},
    "NEWUSER": {"percent": 15, "min_spend": 500, "description": "15% welcome discount"},
}


def _get_or_create_cart(db: Session, user_id: str) -> Cart:
    cart = (
        db.query(Cart)
        .options(
            joinedload(Cart.items).joinedload(CartItem.product)
            .joinedload(Product.inventory),
            joinedload(Cart.items).joinedload(CartItem.product)
            .joinedload(Product.images),
            joinedload(Cart.items).joinedload(CartItem.product)
            .joinedload(Product.merchant),
        )
        .filter(Cart.user_id == user_id)
        .first()
    )
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


def _calculate_cart(cart: Cart) -> dict:
    items_out = []
    subtotal = Decimal("0")

    for item in cart.items:
        p = item.product
        primary_image = None
        if p.images:
            primary = next((img.url for img in p.images if img.is_primary), None)
            primary_image = primary or p.images[0].url

        unit_price = Decimal(str(item.unit_price))
        total_price = unit_price * item.quantity
        subtotal += total_price

        items_out.append({
            "id": item.id,
            "product": {
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "price": float(p.price),
                "primary_image": primary_image,
                "merchant_name": p.merchant.store_name if p.merchant else "",
                "merchant_id": p.merchant.id if p.merchant else "",
                "is_in_stock": p.inventory.is_in_stock if p.inventory else False,
            },
            "quantity": item.quantity,
            "unit_price": float(unit_price),
            "total_price": float(total_price),
        })

    # Coupon discount
    discount = Decimal("0")
    coupon_code = cart.coupon_code
    if coupon_code and coupon_code.upper() in COUPONS:
        rule = COUPONS[coupon_code.upper()]
        if subtotal >= Decimal(str(rule.get("min_spend", 0))):
            if "amount" in rule and rule["amount"]:
                discount = Decimal(str(rule["amount"]))
            elif "percent" in rule and rule["percent"]:
                discount = (subtotal * Decimal(str(rule["percent"])) / 100).quantize(Decimal("0.01"))
            discount = min(discount, subtotal)

    discounted = subtotal - discount
    shipping = Decimal("0") if discounted >= Decimal(str(settings.free_shipping_threshold)) else Decimal(str(settings.flat_shipping_fee))
    total = discounted + shipping

    return {
        "id": cart.id,
        "items": items_out,
        "coupon_code": cart.coupon_code,
        "item_count": sum(item.quantity for item in cart.items),
        "subtotal": float(subtotal),
        "discount": float(discount),
        "shipping": float(shipping),
        "total": float(total),
        "currency": settings.currency,
    }


@router.get("")
def get_cart(user: User = Depends(require_customer), db: Session = Depends(get_db)) -> dict:
    cart = _get_or_create_cart(db, user.id)
    return _calculate_cart(cart)


@router.post("/items", status_code=201)
def add_item(
    req: AddToCartRequest,
    user: User = Depends(require_customer),
    db: Session = Depends(get_db),
) -> dict:
    product = db.get(Product, req.product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")

    inventory = db.query(Inventory).filter(Inventory.product_id == product.id).first()
    if inventory and inventory.track_inventory:
        if inventory.available_quantity < req.quantity:
            raise HTTPException(status_code=400,
                                detail=f"Only {inventory.available_quantity} units available")

    cart = _get_or_create_cart(db, user.id)
    # Check if already in cart
    existing = next((i for i in cart.items if i.product_id == product.id), None)
    if existing:
        new_qty = existing.quantity + req.quantity
        if inventory and inventory.track_inventory and inventory.available_quantity < new_qty:
            raise HTTPException(status_code=400, detail="Exceeds available stock")
        existing.quantity = new_qty
    else:
        cart.items.append(CartItem(
            cart_id=cart.id,
            product_id=product.id,
            quantity=req.quantity,
            unit_price=product.price,
        ))
    db.commit()
    db.refresh(cart)
    return _calculate_cart(cart)


@router.patch("/items/{item_id}")
def update_item(
    item_id: str,
    req: UpdateCartItemRequest,
    user: User = Depends(require_customer),
    db: Session = Depends(get_db),
) -> dict:
    cart = _get_or_create_cart(db, user.id)
    item = next((i for i in cart.items if i.id == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    item.quantity = req.quantity
    db.commit()
    db.refresh(cart)
    return _calculate_cart(cart)


@router.delete("/items/{item_id}")
def remove_item(
    item_id: str,
    user: User = Depends(require_customer),
    db: Session = Depends(get_db),
) -> dict:
    cart = _get_or_create_cart(db, user.id)
    item = next((i for i in cart.items if i.id == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    cart.items.remove(item)
    db.delete(item)
    db.commit()
    db.refresh(cart)
    return _calculate_cart(cart)


@router.delete("")
def clear_cart(user: User = Depends(require_customer), db: Session = Depends(get_db)) -> dict:
    cart = _get_or_create_cart(db, user.id)
    for item in list(cart.items):
        db.delete(item)
    cart.coupon_code = None
    db.commit()
    db.refresh(cart)
    return _calculate_cart(cart)


@router.post("/coupon")
def apply_coupon(
    req: ApplyCouponRequest,
    user: User = Depends(require_customer),
    db: Session = Depends(get_db),
) -> dict:
    code = req.coupon_code.upper()
    if code not in COUPONS:
        raise HTTPException(status_code=400, detail="Invalid coupon code")
    cart = _get_or_create_cart(db, user.id)
    cart.coupon_code = code
    db.commit()
    db.refresh(cart)
    result = _calculate_cart(cart)
    result["coupon_applied"] = COUPONS[code]["description"]
    return result


@router.delete("/coupon")
def remove_coupon(user: User = Depends(require_customer), db: Session = Depends(get_db)) -> dict:
    cart = _get_or_create_cart(db, user.id)
    cart.coupon_code = None
    db.commit()
    db.refresh(cart)
    return _calculate_cart(cart)
