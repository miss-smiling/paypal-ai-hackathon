export interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  store: string;
  category: "headphones" | "charger" | "keyboard" | "backpack" | "wearables";
  price: number;
  original_price: number;
  rating: number;
  reviews_count: number;
  trust_score: number;
  flagged_reviews: number;
  discount_pct: number;
  badge: string;
  highlight: string;
  specs: {
    key_feature: string;
    connectivity: string;
    battery_or_power: string;
    warranty: string;
    delivery: string;
    material_or_switch?: string;
  };
  image_url: string;
  value_verdict?: "Best Overall" | "Best Value" | "Budget Champion" | "Top Performance";
}

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: "deal-boat-480",
    name: "boAt Rockerz 480 ANC Wireless Headphones",
    brand: "boAt",
    store: "Flipkart",
    category: "headphones",
    price: 1899,
    original_price: 3990,
    rating: 4.5,
    reviews_count: 1240,
    trust_score: 94,
    flagged_reviews: 14,
    discount_pct: 52,
    badge: "52% OFF",
    highlight: "Active Noise Cancellation · 30h Battery · 40mm Drivers · Low Latency Beast Mode",
    specs: {
      key_feature: "Hybrid Active Noise Cancellation (up to 32dB)",
      connectivity: "Bluetooth 5.3 + 3.5mm AUX Cable",
      battery_or_power: "30 Hours Playback (ASAP Fast Charge: 10 min = 10 hrs)",
      warranty: "1 Year Official Brand Replacement Warranty",
      delivery: "Free 2-Day Delivery via Flipkart Assured",
      material_or_switch: "Plush Leatherette Cushion with Ergonomic Foldable Earcups",
    },
    image_url:
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTx77ytcs2LUuKDE2wewZHFhzGjGcZxDLCdGZ5nt0Tuec3mbEH46PFdvPDSIIN0lWbVT7JjIUlV0NVOPzLTo91fb_NwCRBA7lKpOmhL3L92Y2qKTHqqyS_Cnw",
    value_verdict: "Best Overall",
  },
  {
    id: "aq-pro",
    name: "AeroQuiet Pro ANC Wireless Headphones",
    brand: "AeroQuiet",
    store: "Amazon.in",
    category: "headphones",
    price: 3499,
    original_price: 6999,
    rating: 4.7,
    reviews_count: 850,
    trust_score: 96,
    flagged_reviews: 8,
    discount_pct: 50,
    badge: "50% OFF",
    highlight: "Studio-Grade ANC · Transparency Mode · 35h Battery · Multi-Device Pairing",
    specs: {
      key_feature: "Advanced Adaptive ANC with 4 Ambient Sound Mics",
      connectivity: "Bluetooth 5.4 with LDAC & AAC Hi-Res Audio",
      battery_or_power: "35 Hours with ANC Enabled (Type-C Quick Charging)",
      warranty: "2 Years Extended International Warranty",
      delivery: "Free Next-Day Prime Delivery",
      material_or_switch: "Aerospace Aluminum Slider & Memory Foam Cushions",
    },
    image_url:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    value_verdict: "Top Performance",
  },
  {
    id: "deal-ambrane-65w",
    name: "Ambrane 65W GaN Fast Charger (3 Ports)",
    brand: "Ambrane",
    store: "Amazon.in",
    category: "charger",
    price: 1799,
    original_price: 3499,
    rating: 4.6,
    reviews_count: 890,
    trust_score: 96,
    flagged_reviews: 6,
    discount_pct: 49,
    badge: "49% OFF",
    highlight: "GaN Fast Charge · 2x Type-C (PD 3.0) + 1x USB-A (QC 4.0) · Multi-Protection",
    specs: {
      key_feature: "Gallium Nitride (GaN III) High Efficiency Core",
      connectivity: "2x USB Type-C (65W Max) + 1x USB Type-A (18W)",
      battery_or_power: "65W Total Power Delivery (Laptop, Tablet & Phone)",
      warranty: "180 Days Manufacturer Replacement Guarantee",
      delivery: "Free Delivery by Amazon Fulfilled",
      material_or_switch: "Flame Retardant Polycarbonate Casing with Foldable Pins",
    },
    image_url:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
    value_verdict: "Best Value",
  },
  {
    id: "vn-gan65",
    name: "VoltNest 65W GaN Compact Travel Adapter",
    brand: "VoltNest",
    store: "Croma",
    category: "charger",
    price: 1999,
    original_price: 3799,
    rating: 4.5,
    reviews_count: 420,
    trust_score: 92,
    flagged_reviews: 11,
    discount_pct: 47,
    badge: "47% OFF",
    highlight: "Pocket-Sized GaN · Intelligent Smart-Power Distribution · Thermal Guard",
    specs: {
      key_feature: "Over-voltage, Over-current & Surge Protection",
      connectivity: "2x Type-C + 1x Type-A Simultaneous Charging",
      battery_or_power: "65W Max (Supports MacBook, Dell XPS, iPhone & Galaxy)",
      warranty: "1 Year Official Croma Verified Warranty",
      delivery: "Same-Day Store Pickup or 48-Hour Delivery",
      material_or_switch: "Matte Heat-Dissipating Alloy Shell",
    },
    image_url:
      "https://images.unsplash.com/photo-1622445268046-8e54e4c2787e?auto=format&fit=crop&w=600&q=80",
    value_verdict: "Budget Champion",
  },
  {
    id: "deal-cosmic-firefly",
    name: "Cosmic Byte Firefly RGB Mechanical Keyboard",
    brand: "Cosmic Byte",
    store: "Amazon.in",
    category: "keyboard",
    price: 2199,
    original_price: 3999,
    rating: 4.4,
    reviews_count: 2150,
    trust_score: 91,
    flagged_reviews: 23,
    discount_pct: 45,
    badge: "45% OFF",
    highlight: "Outemu Blue Mechanical Switches · Per-Key RGB Backlit · Compact TKL Layout",
    specs: {
      key_feature: "Tactile Clicky Outemu Blue Switches (50M Keystroke Lifespan)",
      connectivity: "Braided Detachable USB Type-C Cable with Gold-Plated Jack",
      battery_or_power: "Wired USB (Zero Input Lag & Full N-Key Rollover)",
      warranty: "1 Year Standard Replacement Warranty",
      delivery: "Free Delivery with Amazon Prime",
      material_or_switch: "Double Injection Keycaps on Brushed Metal Top Plate",
    },
    image_url:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
    value_verdict: "Best Value",
  },
  {
    id: "deal-mokobara-transit",
    name: "Mokobara The Transit Workpack 25L Laptop Bag",
    brand: "Mokobara",
    store: "Croma",
    category: "backpack",
    price: 3999,
    original_price: 6999,
    rating: 4.8,
    reviews_count: 670,
    trust_score: 98,
    flagged_reviews: 4,
    discount_pct: 43,
    badge: "43% OFF",
    highlight: "Weatherproof Shell · Dedicated 15.6\" Laptop Pod · Ergonomic Air-Mesh Straps",
    specs: {
      key_feature: "Water-Repellent DWR Nylon & Hidden Anti-Theft Passport Pocket",
      connectivity: "External Luggage Pass-Through Sleeve for Travel Ease",
      battery_or_power: "Integrated USB Charging Pass-Through Port",
      warranty: "1 Year Limited Brand Repair Warranty",
      delivery: "Free Express Shipping across Metro Cities",
      material_or_switch: "Water-Resistant Premium Vegan Leather Accent Fabric",
    },
    image_url:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    value_verdict: "Top Performance",
  },
  {
    id: "deal-noise-pulse3",
    name: "Noise ColorFit Pulse 3 Bluetooth Calling Smartwatch",
    brand: "Noise",
    store: "Reliance Digital",
    category: "wearables",
    price: 1499,
    original_price: 4999,
    rating: 4.3,
    reviews_count: 3410,
    trust_score: 93,
    flagged_reviews: 31,
    discount_pct: 70,
    badge: "70% OFF",
    highlight: "1.96\" Vibrant Display · TruSync Single-Chip Bluetooth Calling · 7-Day Battery",
    specs: {
      key_feature: "1.96\" TFT 550 Nits Ultra-Bright Touchscreen with 100+ Watch Faces",
      connectivity: "Bluetooth 5.3 with Built-in Speaker & High-Fidelity Microphone",
      battery_or_power: "Up to 7 Days Battery Life (2 Days on Frequent BT Calling)",
      warranty: "1 Year Domestic Brand Replacement Warranty",
      delivery: "Free Standard Delivery by Reliance Digital",
      material_or_switch: "IP68 Water & Dust Resistant Zinc Alloy Bezel",
    },
    image_url:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    value_verdict: "Budget Champion",
  },
];
