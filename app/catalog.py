"""Mock product catalog, reviews and coupons used by the demo.

Brands are fictional. Replace with a real feed (retail APIs / vector DB) later.
"""

from __future__ import annotations

PRODUCTS: list[dict] = [
    # --- NOVATEK Flagship Devices ---
    {"id": "novaphone-15-pro", "name": "NovaPhone 15 Pro", "brand": "Novatek",
     "category": "smartphone", "price": 999.00,
     "specs": {"processor": "A17 Pro", "display": "6.7 inch OLED 120Hz", "storage_gb": 256, "battery_h": 29, "titanium": True, "5g": True},
     "rating": 4.9, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80"},
    {"id": "novasound-max", "name": "NovaSound Max Studio Over-Ear", "brand": "Novatek",
     "category": "headphones", "price": 349.00,
     "specs": {"anc": True, "battery_h": 50, "weight_g": 265, "wireless": True, "beryllium": True},
     "rating": 4.9, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"},
    {"id": "novabuds-pro", "name": "NovaBuds Pro", "brand": "Novatek",
     "category": "headphones", "price": 199.00,
     "specs": {"anc": True, "battery_h": 32, "weight_g": 50, "wireless": True, "form": "earbuds"},
     "rating": 4.8, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80"},
    {"id": "novabook-air-m2", "name": "NovaBook Air M2", "brand": "Novatek",
     "category": "laptop", "price": 1299.00,
     "specs": {"processor": "M2", "ram_gb": 16, "storage_gb": 512, "battery_h": 18, "weight_kg": 1.51, "screen_in": 15.3},
     "rating": 4.9, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"},
    {"id": "novawatch-x", "name": "NovaWatch X", "brand": "Novatek",
     "category": "wearables", "price": 249.00,
     "specs": {"display": "AMOLED", "battery_h": 168, "ecg": True, "gps": True, "titanium": True, "water_resistant_m": 50},
     "rating": 4.7, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"},
    {"id": "novapower-gan-120w", "name": "NovaPower GaN 120W Hub", "brand": "Novatek",
     "category": "charger", "price": 79.00,
     "specs": {"watts": 120, "gan": True, "ports": 4},
     "rating": 4.8, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80"},
    {"id": "novacam-360-ai", "name": "NovaCam 360 AI Smart Security", "brand": "Novatek",
     "category": "smart_home", "price": 149.00,
     "specs": {"resolution": "4K", "pan_tilt": True, "ai_detection": True, "night_vision": True},
     "rating": 4.6, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80"},
    {"id": "novapad-ultra-12", "name": "NovaPad Ultra 12 Pro", "brand": "Novatek",
     "category": "tablet", "price": 799.00,
     "specs": {"display": "12.4 inch OLED 120Hz", "battery_h": 15, "stylus": True, "ram_gb": 12},
     "rating": 4.8, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80"},

    # --- Chargers ---
    {"id": "vn-gan65", "name": "VoltNest 65W GaN Travel Charger", "brand": "VoltNest",
     "category": "charger", "price": 34.99,
     "specs": {"watts": 65, "gan": True, "ports": 3}, "rating": 4.6, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80"},
    {"id": "vn-gan30", "name": "VoltNest 30W GaN Mini Charger", "brand": "VoltNest",
     "category": "charger", "price": 19.99,
     "specs": {"watts": 30, "gan": True, "ports": 1}, "rating": 4.5, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1622445268046-8e54e4c2787e?auto=format&fit=crop&w=600&q=80"},
    {"id": "zp-gan100", "name": "ZapPro 100W GaN Desktop Charger", "brand": "ZapPro",
     "category": "charger", "price": 59.99,
     "specs": {"watts": 100, "gan": True, "ports": 4}, "rating": 4.4, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1609592807909-58bfa79fce00?auto=format&fit=crop&w=600&q=80"},
    {"id": "zp-std20", "name": "ZapPro 20W USB-C Wall Charger", "brand": "ZapPro",
     "category": "charger", "price": 12.99,
     "specs": {"watts": 20, "gan": False, "ports": 1}, "rating": 4.1, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80"},

    # --- Headphones / earbuds ---
    {"id": "aq-pro", "name": "AeroQuiet Pro ANC Headphones", "brand": "AeroQuiet",
     "category": "headphones", "price": 199.00,
     "specs": {"anc": True, "battery_h": 30, "weight_g": 250, "wireless": True},
     "rating": 4.7, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"},
    {"id": "aq-lite", "name": "AeroQuiet Lite ANC Earbuds", "brand": "AeroQuiet",
     "category": "headphones", "price": 129.00,
     "specs": {"anc": True, "battery_h": 24, "weight_g": 50, "wireless": True, "form": "earbuds"},
     "rating": 4.3, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80"},
    {"id": "sn-budget", "name": "SonicBase Over-Ear Headphones", "brand": "SonicBase",
     "category": "headphones", "price": 49.99,
     "specs": {"anc": False, "battery_h": 40, "weight_g": 280, "wireless": True},
     "rating": 4.0, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80"},
    {"id": "ec-anc35", "name": "EchoCore ANC Over-Ear", "brand": "EchoCore",
     "category": "headphones", "price": 239.00,
     "specs": {"anc": True, "battery_h": 35, "weight_g": 260, "wireless": True},
     "rating": 4.5, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80"},

    # --- Keyboards ---
    {"id": "kb-mech", "name": "KeyForge Mini Mechanical Keyboard", "brand": "KeyForge",
     "category": "keyboard", "price": 79.00,
     "specs": {"wireless": True, "switches": "brown"}, "rating": 4.6, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80"},
    {"id": "kb-basic", "name": "KeyForge Basic USB Keyboard", "brand": "KeyForge",
     "category": "keyboard", "price": 19.00,
     "specs": {"wireless": False}, "rating": 3.9, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80"},

    # --- Backpacks ---
    {"id": "bp-laptop", "name": "TrailPack 25L Laptop Backpack", "brand": "TrailPack",
     "category": "backpack", "price": 74.00,
     "specs": {"capacity_l": 25, "laptop": True}, "rating": 4.5, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"},
    {"id": "bp-slim", "name": "UrbanSlim 12L Daypack", "brand": "UrbanSlim",
     "category": "backpack", "price": 39.00,
     "specs": {"capacity_l": 12, "laptop": False}, "rating": 4.2, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=600&q=80"},

    # --- Top Deals of the Day (Indian Market) ---
    {"id": "deal-boat-480", "name": "boAt Rockerz 480 ANC Wireless Headphones", "brand": "Flipkart",
     "category": "headphones", "price": 1899.00,
     "specs": {"anc": True, "battery_h": 30, "merchant": "Flipkart", "original_price": 3990.0},
     "rating": 4.5, "stock": True,
     "image_url": "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTx77ytcs2LUuKDE2wewZHFhzGjGcZxDLCdGZ5nt0Tuec3mbEH46PFdvPDSIIN0lWbVT7JjIUlV0NVOPzLTo91fb_NwCRBA7lKpOmhL3L92Y2qKTHqqyS_Cnw"},
    {"id": "deal-ambrane-65w", "name": "Ambrane 65W GaN Fast Charger (3 Ports)", "brand": "Amazon.in",
     "category": "charger", "price": 1799.00,
     "specs": {"watts": 65, "gan": True, "ports": 3, "merchant": "Amazon.in", "original_price": 3499.0},
     "rating": 4.6, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80"},
    {"id": "deal-cosmic-firefly", "name": "Cosmic Byte CB-GK-16 Firefly Mechanical Keyboard", "brand": "Amazon.in",
     "category": "keyboard", "price": 2199.00,
     "specs": {"wireless": False, "switches": "blue", "merchant": "Amazon.in", "original_price": 3999.0},
     "rating": 4.4, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80"},
    {"id": "deal-mokobara-transit", "name": "Mokobara The Transit Workpack 25L Laptop Backpack", "brand": "Croma",
     "category": "backpack", "price": 3999.00,
     "specs": {"capacity_l": 25, "laptop": True, "merchant": "Croma", "original_price": 6999.0},
     "rating": 4.8, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"},
    {"id": "deal-noise-pulse3", "name": "Noise ColorFit Pulse 3 Bluetooth Calling Smartwatch", "brand": "Reliance Digital",
     "category": "wearables", "price": 1499.00,
     "specs": {"display": "1.96 TFT", "merchant": "Reliance Digital", "original_price": 4999.0},
     "rating": 4.3, "stock": True,
     "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"},
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
    "deal-boat-480": [
        {"author": "rahul_v", "rating": 5, "verified": True, "text": "Bass is punchy and ANC cuts out fan noise completely. Best under 2k."},
        {"author": "priya_s", "rating": 4, "verified": True, "text": "Comfortable ear cushions. Battery easily gives 25-30 hours."},
    ],
    "deal-ambrane-65w": [
        {"author": "amit_k", "rating": 5, "verified": True, "text": "Charges my MacBook Air and iPhone simultaneously at full speed."},
    ],
    "deal-cosmic-firefly": [
        {"author": "gamer_rohit", "rating": 4, "verified": True, "text": "Outemu blue clicks are very satisfying. RGB modes are great."},
    ],
    "deal-mokobara-transit": [
        {"author": "ananya_d", "rating": 5, "verified": True, "text": "Premium zippers and dedicated laptop compartment. Worth the price."},
    ],
    "deal-noise-pulse3": [
        {"author": "deepak_m", "rating": 4, "verified": True, "text": "Calling is clear and screen is bright enough in Delhi sunlight."},
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


LIVE_PRODUCTS: dict[str, dict] = {}


def register_live_product(product: dict) -> None:
    LIVE_PRODUCTS[product["id"]] = product


def get_product(product_id: str) -> dict | None:
    if product_id in LIVE_PRODUCTS:
        return LIVE_PRODUCTS[product_id]
    for product in PRODUCTS:
        if product["id"] == product_id:
            return product
    return None
