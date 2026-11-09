"""Seed the database with demo merchants, categories, and products.

Run:  python -m app.database.seed
"""
from __future__ import annotations

import sys
from datetime import datetime, timezone

from app.core.security import hash_password
from app.database.init_db import init_db
from app.database.session import SessionLocal
from app.models.user import User, CustomerProfile, MerchantProfile
from app.models.product import Category, Product, ProductImage, ProductAttribute, Inventory
from app.models.review import Review


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


CATEGORIES = [
    {"name": "Electronics", "slug": "electronics", "icon": "💻", "sort_order": 1,
     "description": "Gadgets, chargers, headphones and more"},
    {"name": "Fashion", "slug": "fashion", "icon": "👗", "sort_order": 2,
     "description": "Clothing, footwear and accessories"},
    {"name": "Home & Kitchen", "slug": "home-kitchen", "icon": "🏠", "sort_order": 3,
     "description": "Furniture, appliances and decor"},
    {"name": "Books", "slug": "books", "icon": "📚", "sort_order": 4,
     "description": "Bestsellers, textbooks and more"},
    {"name": "Accessories", "slug": "accessories", "icon": "🎒", "sort_order": 5,
     "description": "Bags, wallets and lifestyle accessories"},
]

# 3 demo merchants
MERCHANTS = [
    {
        "email": "merchant1@techwave.in",
        "full_name": "Arjun Sharma",
        "password": "Merchant@123",
        "store_name": "TechWave India",
        "store_slug": "techwave-india",
        "description": "Premium electronics and gadgets for the modern Indian professional.",
        "logo_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop",
        "banner_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=300&fit=crop",
        "status": "approved",
    },
    {
        "email": "merchant2@stylestreet.in",
        "full_name": "Priya Patel",
        "password": "Merchant@123",
        "store_name": "StyleStreet",
        "store_slug": "stylestreet",
        "description": "Contemporary Indian fashion that blends tradition with modern style.",
        "logo_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop",
        "banner_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=300&fit=crop",
        "status": "approved",
    },
    {
        "email": "merchant3@booknest.in",
        "full_name": "Rahul Verma",
        "password": "Merchant@123",
        "store_name": "BookNest & Living",
        "store_slug": "booknest-living",
        "description": "Curated books, home essentials and lifestyle products.",
        "logo_url": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop",
        "banner_url": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=300&fit=crop",
        "status": "approved",
    },
]

# Products: (merchant_slug, category_slug, product_data)
PRODUCTS_DATA = [
    # ─── TechWave India — Electronics ──────────────────────────────────────
    ("techwave-india", "electronics", {
        "name": "VoltNest 65W GaN Travel Charger",
        "slug": "voltnest-65w-gan-charger",
        "brand": "VoltNest",
        "description": "Charge your laptop, phone and earbuds simultaneously with this ultra-compact 65W GaN charger. 3 ports, foldable plug, universal voltage. Perfect carry-on companion.",
        "price": 2999,
        "compare_at_price": 3999,
        "sku": "VN-GAN65",
        "is_featured": True,
        "avg_rating": 4.6,
        "review_count": 128,
        "attrs": [("Wattage", "65W", None), ("Ports", "3", None), ("Technology", "GaN", None), ("Compatibility", "Universal", None)],
        "stock": 85,
        "images": ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop"],
    }),
    ("techwave-india", "electronics", {
        "name": "VoltNest 30W GaN Mini Charger",
        "slug": "voltnest-30w-gan-mini",
        "brand": "VoltNest",
        "description": "Pocket-sized 30W GaN charger. Single USB-C port with Power Delivery for fast charging phones and tablets.",
        "price": 1499,
        "compare_at_price": 1999,
        "sku": "VN-GAN30",
        "is_featured": False,
        "avg_rating": 4.5,
        "review_count": 89,
        "attrs": [("Wattage", "30W", None), ("Ports", "1", None), ("Technology", "GaN", None)],
        "stock": 150,
        "images": ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop"],
    }),
    ("techwave-india", "electronics", {
        "name": "ZapPro 100W GaN Desktop Charger",
        "slug": "zappro-100w-gan-desktop",
        "brand": "ZapPro",
        "description": "Power your entire workstation from one hub. 4 ports (2×USB-C + 2×USB-A), 100W total output, desktop-grade.",
        "price": 4999,
        "compare_at_price": 6499,
        "sku": "ZP-GAN100",
        "is_featured": True,
        "avg_rating": 4.4,
        "review_count": 67,
        "attrs": [("Wattage", "100W", None), ("Ports", "4", None), ("Technology", "GaN", None)],
        "stock": 42,
        "images": ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop"],
    }),
    ("techwave-india", "electronics", {
        "name": "AeroQuiet Pro ANC Headphones",
        "slug": "aeroquiet-pro-anc",
        "brand": "AeroQuiet",
        "description": "Studio-grade active noise cancellation with 30-hour battery life. Foldable, lightweight design with premium leather ear cushions.",
        "price": 14999,
        "compare_at_price": 19999,
        "sku": "AQ-PRO-ANC",
        "is_featured": True,
        "avg_rating": 4.7,
        "review_count": 243,
        "attrs": [("ANC", "Yes", None), ("Battery", "30h", None), ("Wireless", "Yes", None), ("Weight", "250g", None)],
        "stock": 38,
        "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"],
    }),
    ("techwave-india", "electronics", {
        "name": "AeroQuiet Lite ANC Earbuds",
        "slug": "aeroquiet-lite-anc-earbuds",
        "brand": "AeroQuiet",
        "description": "True wireless ANC earbuds with 24-hour total battery (6h + 18h case). IPX5 water resistant. Ideal for gym and commute.",
        "price": 9999,
        "compare_at_price": 12999,
        "sku": "AQ-LITE-TWS",
        "is_featured": False,
        "avg_rating": 4.3,
        "review_count": 156,
        "attrs": [("ANC", "Yes", None), ("Battery", "24h total", None), ("Wireless", "Yes", None), ("Form", "Earbuds", None), ("IPX", "5", None)],
        "stock": 65,
        "images": ["https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&h=600&fit=crop"],
    }),
    ("techwave-india", "electronics", {
        "name": "SonicBase Over-Ear Headphones",
        "slug": "sonicbase-over-ear",
        "brand": "SonicBase",
        "description": "40-hour battery wireless over-ear headphones. No ANC but excellent passive isolation. Foldable design for students and budget-conscious buyers.",
        "price": 3999,
        "compare_at_price": 5499,
        "sku": "SB-OE-40H",
        "is_featured": False,
        "avg_rating": 4.0,
        "review_count": 312,
        "attrs": [("ANC", "No", None), ("Battery", "40h", None), ("Wireless", "Yes", None), ("Weight", "280g", None)],
        "stock": 120,
        "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"],
    }),
    ("techwave-india", "electronics", {
        "name": "EchoCore ANC Over-Ear Premium",
        "slug": "echocore-anc-over-ear",
        "brand": "EchoCore",
        "description": "Professional-grade ANC with 35-hour battery. LDAC high-res audio support. Comes with hard-shell carrying case.",
        "price": 18999,
        "compare_at_price": 24999,
        "sku": "EC-ANC35",
        "is_featured": True,
        "avg_rating": 4.5,
        "review_count": 89,
        "attrs": [("ANC", "Yes", None), ("Battery", "35h", None), ("Wireless", "Yes", None), ("Audio", "LDAC", None)],
        "stock": 28,
        "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"],
    }),
    ("techwave-india", "electronics", {
        "name": "KeyForge Mini Mechanical Keyboard",
        "slug": "keyforge-mini-mechanical",
        "brand": "KeyForge",
        "description": "Compact TKL mechanical keyboard with Bluetooth 5.0 + 2.4GHz wireless. Brown switches. 3-device multi-pairing. RGB backlit.",
        "price": 5999,
        "compare_at_price": 7999,
        "sku": "KF-MECH-TKL",
        "is_featured": True,
        "avg_rating": 4.6,
        "review_count": 178,
        "attrs": [("Wireless", "Yes", None), ("Switches", "Brown", None), ("Layout", "TKL", None), ("Backlight", "RGB", None)],
        "stock": 55,
        "images": ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop"],
    }),
    ("techwave-india", "electronics", {
        "name": "KeyForge Basic USB Keyboard",
        "slug": "keyforge-basic-usb",
        "brand": "KeyForge",
        "description": "Reliable membrane keyboard with full-size layout and spill-resistant coating. Plug and play. Great for offices.",
        "price": 999,
        "compare_at_price": 1499,
        "sku": "KF-BASIC-USB",
        "is_featured": False,
        "avg_rating": 3.9,
        "review_count": 445,
        "attrs": [("Wireless", "No", None), ("Type", "Membrane", None), ("Layout", "Full-size", None)],
        "stock": 200,
        "images": ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop"],
    }),
    # ─── StyleStreet — Fashion ─────────────────────────────────────────────
    ("stylestreet", "fashion", {
        "name": "Urban Canvas Slim Fit Chinos",
        "slug": "urban-canvas-slim-chinos",
        "brand": "UrbanCanvas",
        "description": "Premium cotton-blend slim-fit chinos. Wrinkle-resistant finish, 4-pocket design. Available in stone, navy and olive.",
        "price": 1999,
        "compare_at_price": 2999,
        "sku": "UC-CHINO-SLIM",
        "is_featured": True,
        "avg_rating": 4.4,
        "review_count": 267,
        "attrs": [("Fabric", "Cotton blend", None), ("Fit", "Slim", None), ("Care", "Machine wash", None)],
        "stock": 180,
        "images": ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop"],
    }),
    ("stylestreet", "fashion", {
        "name": "EthnoCraft Handloom Kurta Set",
        "slug": "ethnocraft-handloom-kurta",
        "brand": "EthnoCraft",
        "description": "Hand-woven pure cotton kurta with matching palazzo. Traditional block-print design. Sustainable and artisan-crafted.",
        "price": 2499,
        "compare_at_price": 3499,
        "sku": "EC-KURTA-HL",
        "is_featured": True,
        "avg_rating": 4.7,
        "review_count": 134,
        "attrs": [("Fabric", "100% Cotton", None), ("Craft", "Block Print", None), ("Occasion", "Casual / Festive", None)],
        "stock": 60,
        "images": ["https://images.unsplash.com/photo-1583391733956-62e436fb0ad6?w=600&h=600&fit=crop"],
    }),
    ("stylestreet", "fashion", {
        "name": "SolePride Leather Derby Shoes",
        "slug": "solepride-leather-derby",
        "brand": "SolePride",
        "description": "Full-grain leather derby shoes with cushioned insole and anti-slip rubber sole. Office-ready, all-day comfort.",
        "price": 3499,
        "compare_at_price": 5499,
        "sku": "SP-DERBY-FG",
        "is_featured": False,
        "avg_rating": 4.3,
        "review_count": 89,
        "attrs": [("Material", "Full-grain leather", None), ("Sole", "Rubber", None), ("Occasion", "Formal", None)],
        "stock": 45,
        "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"],
    }),
    ("stylestreet", "fashion", {
        "name": "NovaSport Running Shoes",
        "slug": "novasport-running-shoes",
        "brand": "NovaSport",
        "description": "Lightweight mesh running shoes with responsive foam midsole. Breathable upper, cushioned heel drop for long runs.",
        "price": 2999,
        "compare_at_price": 4499,
        "sku": "NS-RUN-MESH",
        "is_featured": True,
        "avg_rating": 4.5,
        "review_count": 312,
        "attrs": [("Upper", "Mesh", None), ("Midsole", "Responsive Foam", None), ("Weight", "280g/shoe", None), ("Drop", "8mm", None)],
        "stock": 95,
        "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"],
    }),
    ("stylestreet", "accessories", {
        "name": "TrailPack 25L Laptop Backpack",
        "slug": "trailpack-25l-laptop-backpack",
        "brand": "TrailPack",
        "description": "Padded 15.6\" laptop compartment, TSA-friendly design, rain-resistant fabric. 25L capacity fits a weekend getaway.",
        "price": 3499,
        "compare_at_price": 4999,
        "sku": "TP-BP-25L",
        "is_featured": True,
        "avg_rating": 4.5,
        "review_count": 198,
        "attrs": [("Capacity", "25L", None), ("Laptop", "Up to 15.6\"", None), ("Material", "Rain-resistant nylon", None)],
        "stock": 72,
        "images": ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"],
    }),
    ("stylestreet", "accessories", {
        "name": "UrbanSlim 12L Daypack",
        "slug": "urbanslim-12l-daypack",
        "brand": "UrbanSlim",
        "description": "Minimalist 12L daypack. Padded back panel, hidden anti-theft pocket. Perfect for city commutes.",
        "price": 1799,
        "compare_at_price": 2499,
        "sku": "US-DP-12L",
        "is_featured": False,
        "avg_rating": 4.2,
        "review_count": 156,
        "attrs": [("Capacity", "12L", None), ("Laptop", "No", None), ("Feature", "Anti-theft pocket", None)],
        "stock": 110,
        "images": ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"],
    }),
    ("stylestreet", "accessories", {
        "name": "LeatherCraft Bi-fold Wallet",
        "slug": "leathercraft-bifold-wallet",
        "brand": "LeatherCraft",
        "description": "Genuine leather bi-fold wallet with RFID blocking. 8 card slots, 2 currency compartments.",
        "price": 999,
        "compare_at_price": 1499,
        "sku": "LC-BIFOLD-RFID",
        "is_featured": False,
        "avg_rating": 4.4,
        "review_count": 445,
        "attrs": [("Material", "Genuine leather", None), ("RFID", "Yes", None), ("Card Slots", "8", None)],
        "stock": 200,
        "images": ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop"],
    }),
    # ─── BookNest & Living — Books + Home ─────────────────────────────────
    ("booknest-living", "books", {
        "name": "Atomic Habits — James Clear",
        "slug": "atomic-habits-james-clear",
        "brand": "Random House",
        "description": "The #1 New York Times bestseller on building good habits. Over 5 million copies sold. Paperback edition.",
        "price": 499,
        "compare_at_price": 699,
        "sku": "BK-ATOMIC-PB",
        "is_featured": True,
        "avg_rating": 4.8,
        "review_count": 1245,
        "attrs": [("Author", "James Clear", None), ("Format", "Paperback", None), ("Pages", "320", None), ("Language", "English", None)],
        "stock": 300,
        "images": ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop"],
    }),
    ("booknest-living", "books", {
        "name": "The Psychology of Money — Morgan Housel",
        "slug": "psychology-of-money-housel",
        "brand": "Harriman House",
        "description": "19 timeless stories about wealth, greed and happiness. Essential reading for anyone who wants to think clearly about money.",
        "price": 449,
        "compare_at_price": 599,
        "sku": "BK-PSYMONEY-PB",
        "is_featured": True,
        "avg_rating": 4.7,
        "review_count": 892,
        "attrs": [("Author", "Morgan Housel", None), ("Format", "Paperback", None), ("Pages", "256", None)],
        "stock": 250,
        "images": ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop"],
    }),
    ("booknest-living", "books", {
        "name": "Zero to One — Peter Thiel",
        "slug": "zero-to-one-peter-thiel",
        "brand": "Currency",
        "description": "Notes on startups and how to build the future. Peter Thiel's essential startup philosophy.",
        "price": 399,
        "compare_at_price": 549,
        "sku": "BK-ZEROTOONE-PB",
        "is_featured": False,
        "avg_rating": 4.5,
        "review_count": 567,
        "attrs": [("Author", "Peter Thiel", None), ("Format", "Paperback", None), ("Pages", "224", None)],
        "stock": 180,
        "images": ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop"],
    }),
    ("booknest-living", "home-kitchen", {
        "name": "CozyCraft Ceramic Pour-Over Set",
        "slug": "cozycraft-ceramic-pour-over",
        "brand": "CozyCraft",
        "description": "Hand-thrown ceramic pour-over dripper with matching server. For coffee enthusiasts who want a ritual, not just a drink.",
        "price": 1899,
        "compare_at_price": 2499,
        "sku": "CC-POUROVER-SET",
        "is_featured": True,
        "avg_rating": 4.6,
        "review_count": 89,
        "attrs": [("Material", "Ceramic", None), ("Capacity", "400ml", None), ("Includes", "Dripper + Server", None)],
        "stock": 40,
        "images": ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop"],
    }),
    ("booknest-living", "home-kitchen", {
        "name": "LuminArc Desk Lamp — Natural Light",
        "slug": "luminarc-desk-lamp",
        "brand": "LuminArc",
        "description": "5000K natural daylight LED desk lamp. Touch-dimmer, USB-A charging port, eye-care flicker-free light. Perfect for reading and WFH.",
        "price": 2299,
        "compare_at_price": 3299,
        "sku": "LA-DESK-5000K",
        "is_featured": True,
        "avg_rating": 4.5,
        "review_count": 134,
        "attrs": [("Color Temp", "5000K", None), ("Dimmer", "Touch", None), ("USB Port", "Yes", None), ("Eye-care", "Flicker-free", None)],
        "stock": 65,
        "images": ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop"],
    }),
    ("booknest-living", "home-kitchen", {
        "name": "NestWarm Scented Candle Set",
        "slug": "nestwarm-scented-candles",
        "brand": "NestWarm",
        "description": "Set of 3 soy-wax candles: Sandalwood, Jasmine & Vetiver. 40-hour burn time each. Hand-poured in Mumbai.",
        "price": 999,
        "compare_at_price": 1499,
        "sku": "NW-CANDLE-SET3",
        "is_featured": False,
        "avg_rating": 4.7,
        "review_count": 223,
        "attrs": [("Wax", "Soy", None), ("Burn Time", "40h each", None), ("Scents", "Sandalwood, Jasmine, Vetiver", None), ("Qty", "3 candles", None)],
        "stock": 150,
        "images": ["https://images.unsplash.com/photo-1543514742-6d8b921b1b0c?w=600&h=600&fit=crop"],
    }),
    ("booknest-living", "home-kitchen", {
        "name": "GreenLeaf Air Purifier 400 sq.ft",
        "slug": "greenleaf-air-purifier-400",
        "brand": "GreenLeaf",
        "description": "True HEPA H13 filter removes 99.97% of particles. Auto mode, PM2.5 display, ultra-quiet sleep mode. For rooms up to 400 sq.ft.",
        "price": 8999,
        "compare_at_price": 12999,
        "sku": "GL-AP-400",
        "is_featured": True,
        "avg_rating": 4.4,
        "review_count": 312,
        "attrs": [("Filter", "HEPA H13", None), ("Coverage", "400 sq.ft", None), ("Noise", "< 25dB sleep mode", None), ("Display", "PM2.5", None)],
        "stock": 30,
        "images": ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop"],
    }),
    ("booknest-living", "accessories", {
        "name": "Moleskine Classic Notebook — A5 Hardcover",
        "slug": "moleskine-classic-a5-hardcover",
        "brand": "Moleskine",
        "description": "The legendary hardcover notebook. 240 acid-free pages with an elastic closure and ribbon bookmark. Ruled.",
        "price": 999,
        "compare_at_price": 1299,
        "sku": "MOL-A5-HARD-RUL",
        "is_featured": False,
        "avg_rating": 4.6,
        "review_count": 678,
        "attrs": [("Size", "A5", None), ("Pages", "240", None), ("Cover", "Hardcover", None), ("Ruling", "Ruled", None)],
        "stock": 300,
        "images": ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop"],
    }),
]


def seed(force: bool = False) -> None:
    """Idempotent seed — skips if data already exists."""
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@smartkart.in").first() and not force:
            print("Database already seeded. Use force=True to re-seed.")
            return

        # ── Admin user ───────────────────────────────────────────────────────
        admin = User(
            email="admin@smartkart.in",
            full_name="SmartKart Admin",
            hashed_password=hash_password("Admin@123"),
            role="admin",
            is_active=True,
            is_verified=True,
        )
        db.add(admin)
        db.flush()

        # ── Demo customer ────────────────────────────────────────────────────
        customer = User(
            email="demo@smartkart.in",
            full_name="Demo Customer",
            hashed_password=hash_password("Demo@123"),
            role="customer",
            is_active=True,
            is_verified=True,
        )
        db.add(customer)
        db.flush()
        db.add(CustomerProfile(user_id=customer.id, phone="+91-9876543210"))

        # ── Categories ───────────────────────────────────────────────────────
        cat_map: dict[str, Category] = {}
        for cat_data in CATEGORIES:
            cat = Category(**cat_data)
            db.add(cat)
            db.flush()
            cat_map[cat.slug] = cat

        # ── Merchants ────────────────────────────────────────────────────────
        merchant_map: dict[str, MerchantProfile] = {}
        for m_data in MERCHANTS:
            m_user = User(
                email=m_data["email"],
                full_name=m_data["full_name"],
                hashed_password=hash_password(m_data["password"]),
                role="merchant",
                is_active=True,
                is_verified=True,
            )
            db.add(m_user)
            db.flush()
            m_profile = MerchantProfile(
                user_id=m_user.id,
                store_name=m_data["store_name"],
                store_slug=m_data["store_slug"],
                description=m_data["description"],
                logo_url=m_data["logo_url"],
                banner_url=m_data["banner_url"],
                status=m_data["status"],
                approved_at=_utcnow() if m_data["status"] == "approved" else None,
            )
            db.add(m_profile)
            db.flush()
            merchant_map[m_data["store_slug"]] = m_profile

        # ── Products ─────────────────────────────────────────────────────────
        for merchant_slug, cat_slug, p in PRODUCTS_DATA:
            merchant = merchant_map[merchant_slug]
            cat = cat_map[cat_slug]
            product = Product(
                merchant_id=merchant.id,
                category_id=cat.id,
                name=p["name"],
                slug=p["slug"],
                brand=p.get("brand"),
                description=p.get("description"),
                price=p["price"],
                compare_at_price=p.get("compare_at_price"),
                sku=p.get("sku"),
                is_featured=p.get("is_featured", False),
                is_active=True,
                avg_rating=p.get("avg_rating", 0.0),
                review_count=p.get("review_count", 0),
            )
            db.add(product)
            db.flush()

            # Attributes
            for key, value, unit in p.get("attrs", []):
                db.add(ProductAttribute(product_id=product.id, key=key, value=value, unit=unit))

            # Images
            for i, url in enumerate(p.get("images", [])):
                db.add(ProductImage(
                    product_id=product.id, url=url,
                    sort_order=i, is_primary=(i == 0)
                ))

            # Inventory
            db.add(Inventory(product_id=product.id, quantity=p.get("stock", 50)))

        db.commit()
        print(f"✅ Seeded: 1 admin, 1 customer, {len(MERCHANTS)} merchants, {len(PRODUCTS_DATA)} products")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    force = "--force" in sys.argv
    init_db()
    seed(force=force)
