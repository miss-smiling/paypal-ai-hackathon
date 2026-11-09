"""Mock product catalog, reviews and coupons used by the demo.

Brands are fictional. Replace with a real feed (retail APIs / vector DB) later.
"""

from __future__ import annotations

PRODUCTS: list[dict] = [
    # --- Chargers ---
    {"id": "vn-gan65", "name": "VoltNest 65W GaN Travel Charger", "brand": "VoltNest",
     "category": "charger", "price": 34.99,
     "specs": {"watts": 65, "gan": True, "ports": 3}, "rating": 4.6, "stock": True},
    {"id": "vn-gan30", "name": "VoltNest 30W GaN Mini Charger", "brand": "VoltNest",
     "category": "charger", "price": 19.99,
     "specs": {"watts": 30, "gan": True, "ports": 1}, "rating": 4.5, "stock": True},
    {"id": "zp-gan100", "name": "ZapPro 100W GaN Desktop Charger", "brand": "ZapPro",
     "category": "charger", "price": 59.99,
     "specs": {"watts": 100, "gan": True, "ports": 4}, "rating": 4.4, "stock": True},
    {"id": "zp-std20", "name": "ZapPro 20W USB-C Wall Charger", "brand": "ZapPro",
     "category": "charger", "price": 12.99,
     "specs": {"watts": 20, "gan": False, "ports": 1}, "rating": 4.1, "stock": True},

    # --- Headphones / earbuds ---
    {"id": "aq-pro", "name": "AeroQuiet Pro ANC Headphones", "brand": "AeroQuiet",
     "category": "headphones", "price": 199.00,
     "specs": {"anc": True, "battery_h": 30, "weight_g": 250, "wireless": True},
     "rating": 4.7, "stock": True},
    {"id": "aq-lite", "name": "AeroQuiet Lite ANC Earbuds", "brand": "AeroQuiet",
     "category": "headphones", "price": 129.00,
     "specs": {"anc": True, "battery_h": 24, "weight_g": 50, "wireless": True, "form": "earbuds"},
     "rating": 4.3, "stock": True},
    {"id": "sn-budget", "name": "SonicBase Over-Ear Headphones", "brand": "SonicBase",
     "category": "headphones", "price": 49.99,
     "specs": {"anc": False, "battery_h": 40, "weight_g": 280, "wireless": True},
     "rating": 4.0, "stock": True},
    {"id": "ec-anc35", "name": "EchoCore ANC Over-Ear", "brand": "EchoCore",
     "category": "headphones", "price": 239.00,
     "specs": {"anc": True, "battery_h": 35, "weight_g": 260, "wireless": True},
     "rating": 4.5, "stock": True},

    # --- Keyboards ---
    {"id": "kb-mech", "name": "KeyForge Mini Mechanical Keyboard", "brand": "KeyForge",
     "category": "keyboard", "price": 79.00,
     "specs": {"wireless": True, "switches": "brown"}, "rating": 4.6, "stock": True},
    {"id": "kb-basic", "name": "KeyForge Basic USB Keyboard", "brand": "KeyForge",
     "category": "keyboard", "price": 19.00,
     "specs": {"wireless": False}, "rating": 3.9, "stock": True},

    # --- Backpacks ---
    {"id": "bp-laptop", "name": "TrailPack 25L Laptop Backpack", "brand": "TrailPack",
     "category": "backpack", "price": 74.00,
     "specs": {"capacity_l": 25, "laptop": True}, "rating": 4.5, "stock": True},
    {"id": "bp-slim", "name": "UrbanSlim 12L Daypack", "brand": "UrbanSlim",
     "category": "backpack", "price": 39.00,
     "specs": {"capacity_l": 12, "laptop": False}, "rating": 4.2, "stock": True},
]

# Reviews. "verified" = purchase verified. Some entries are deliberately
# suspicious (duplicate text, unverified 5-star one-liners) so the Review
# Sentiment Agent has something real to catch.
REVIEWS: dict[str, list[dict]] = {
    "vn-gan65": [
        {"author": "mkt_jan", "rating": 5, "verified": True,
         "text": "Charges my laptop and phone at the same time. Compact enough for carry-on."},
        {"author": "ravi88", "rating": 4, "verified": True,
         "text": "Solid build. Gets a bit warm under heavy load but nothing alarming."},
        {"author": "fastbuy_01", "rating": 5, "verified": False, "text": "Best charger ever buy now"},
        {"author": "fastbuy_02", "rating": 5, "verified": False, "text": "Best charger ever buy now"},
    ],
    "vn-gan30": [
        {"author": "lena_t", "rating": 5, "verified": True,
         "text": "Tiny and fast enough for my phone and earbuds."},
        {"author": "dev_omar", "rating": 4, "verified": True,
         "text": "Great for travel. Only one port, so pick it carefully."},
    ],
    "zp-gan100": [
        {"author": "studio_k", "rating": 5, "verified": True,
         "text": "Replaced three chargers on my desk. Four ports is a real win."},
        {"author": "anon9921", "rating": 2, "verified": True,
         "text": "Too big for a backpack and the cable is short."},
    ],
    "zp-std20": [
        {"author": "sam_w", "rating": 4, "verified": True,
         "text": "Cheap, reliable, does the job for phones."},
    ],
    "aq-pro": [
        {"author": "claire_p", "rating": 5, "verified": True,
         "text": "Noise cancelling on flights is excellent. Battery lasts all week."},
        {"author": "tom_h", "rating": 4, "verified": True,
         "text": "Very comfortable. The app is clunky but the sound is great."},
        {"author": "bot_x7", "rating": 5, "verified": False, "text": "Amazing amazing product five stars"},
        {"author": "bot_x8", "rating": 5, "verified": False, "text": "Amazing amazing product five stars"},
        {"author": "bot_x9", "rating": 5, "verified": False, "text": "Amazing amazing product five stars"},
    ],
    "aq-lite": [
        {"author": "gym_rat", "rating": 4, "verified": True,
         "text": "Stay put during workouts and the ANC is decent for the price."},
    ],
    "sn-budget": [
        {"author": "student_m", "rating": 4, "verified": True,
         "text": "Battery is huge for the price. No ANC, but fine for a library."},
        {"author": "jo_b", "rating": 3, "verified": True,
         "text": "Heavy after a few hours. Sound is good."},
    ],
    "ec-anc35": [
        {"author": "ana_r", "rating": 5, "verified": True,
         "text": "Better ANC than my last pair and very light for over-ear."},
    ],
    "kb-mech": [
        {"author": "keys_and_coffee", "rating": 5, "verified": True,
         "text": "Brown switches are a nice middle ground. Bluetooth pairing is painless."},
        {"author": "newacct_22", "rating": 5, "verified": False, "text": "Perfect perfect"},
    ],
    "kb-basic": [
        {"author": "office_ed", "rating": 4, "verified": True,
         "text": "Does what it says. Nothing fancy."},
    ],
    "bp-laptop": [
        {"author": "nomad_li", "rating": 5, "verified": True,
         "text": "Laptop sleeve is padded and the 25L fits a weekend trip."},
        {"author": "cyclist_p", "rating": 4, "verified": True,
         "text": "Comfortable straps. A bit bulky for a small frame."},
    ],
    "bp-slim": [
        {"author": "city_mo", "rating": 4, "verified": True,
         "text": "Good daypack. Not for a laptop, but perfect for gym clothes."},
    ],
}

COUPONS: dict[str, dict] = {
    # code -> rule. Amount in dollars unless percent is set.
    "FLYTECH25": {"amount": 25.0, "percent": None, "min_spend": 100.0,
                  "category": "headphones", "description": "$25 off headphones over $100"},
    "SAVE10": {"amount": None, "percent": 10.0, "min_spend": 50.0,
               "category": None, "description": "10% off orders over $50"},
    "CHARGE5": {"amount": 5.0, "percent": None, "min_spend": 25.0,
                "category": "charger", "description": "$5 off chargers over $25"},
}


def get_product(product_id: str) -> dict | None:
    for product in PRODUCTS:
        if product["id"] == product_id:
            return product
    return None
