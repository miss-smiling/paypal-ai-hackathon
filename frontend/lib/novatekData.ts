export interface NovatekProduct {
  id: string;
  name: string;
  category: "Smartphones" | "Laptops" | "Audio" | "Wearables" | "Accessories" | "Smart Home" | "Tablets";
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  trustScore: number;
  badge?: "New" | "Best Seller" | "Sale" | "Flagship" | "Editor's Choice";
  badgeColor?: string;
  tagline: string;
  description: string;
  image: string;
  inStock: boolean;
  specs: {
    processor?: string;
    display?: string;
    battery?: string;
    batteryHours?: number;
    connectivity?: string;
    build?: string;
    weight?: string;
    storage?: string;
    camera?: string;
    audio?: string;
    charging?: string;
    waterResistance?: string;
    warranty?: string;
    ports?: string;
  };
  features: string[];
}

export interface CategoryInfo {
  id: string;
  name: "Smartphones" | "Laptops" | "Audio" | "Wearables" | "Accessories" | "Smart Home";
  count: number;
  image: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "smartphones",
    name: "Smartphones",
    count: 8,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
    description: "Next-gen titanium flagship phones with pro camera systems",
  },
  {
    id: "laptops",
    name: "Laptops",
    count: 6,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    description: "Ultra-thin, liquid retina displays engineered for creators",
  },
  {
    id: "audio",
    name: "Audio",
    count: 12,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
    description: "Lossless studio acoustics, adaptive ANC & spatial sound",
  },
  {
    id: "wearables",
    name: "Wearables",
    count: 9,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    description: "Titanium smartwatches with precision bio-sensors & GPS",
  },
  {
    id: "accessories",
    name: "Accessories",
    count: 15,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
    description: "High-wattage GaN chargers, braided cables & MagSafe docks",
  },
  {
    id: "smarthome",
    name: "Smart Home",
    count: 7,
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
    description: "Edge AI cameras, smart hubs & ambient ecosystem sensors",
  },
];

export const NOVATEK_PRODUCTS: NovatekProduct[] = [
  {
    id: "novaphone-15-pro",
    name: "NovaPhone 15 Pro",
    category: "Smartphones",
    price: 999,
    originalPrice: 1099,
    rating: 4.9,
    reviewCount: 2450,
    trustScore: 98,
    badge: "New",
    badgeColor: "bg-blue-600 text-white",
    tagline: "Titanium Power. Precision Engineered.",
    description:
      "Forged in aerospace-grade titanium with the breakthrough A17 Pro chip, custom Action button, and the most versatile pro camera system ever in a NovaPhone.",
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    specs: {
      processor: "A17 Pro 3nm (6-core CPU, 6-core GPU)",
      display: "6.7\" Super Retina XDR OLED 120Hz ProMotion (2000 nits)",
      battery: "29 hours video playback · 50% in 30 mins",
      batteryHours: 29,
      connectivity: "5G Sub-6/mmWave · Wi-Fi 7 · Bluetooth 5.4 · USB-C 10Gbps",
      build: "Grade 5 Aerospace Titanium · Ceramic Shield Front",
      weight: "221g (7.81 oz)",
      storage: "256GB / 512GB / 1TB NVMe",
      camera: "48MP Main + 5x Optical Telephoto + 12MP Ultra-Wide Macro",
      charging: "MagSafe 15W · Qi2 · USB-C PD 3.0 (30W)",
      waterResistance: "IP68 (6m depth up to 30 mins)",
      warranty: "2-Year Novatek Care+ Included",
    },
    features: [
      "Aerospace Titanium lightweight unibody frame",
      "Next-generation portrait photography with focus & depth control",
      "Dynamic Island notifications & interactive live activities",
      "Hardware-accelerated ray tracing for console-grade gaming",
    ],
  },
  {
    id: "novabuds-pro",
    name: "NovaBuds Pro",
    category: "Audio",
    price: 199,
    originalPrice: 229,
    rating: 4.8,
    reviewCount: 4120,
    trustScore: 96,
    badge: "Best Seller",
    badgeColor: "bg-amber-600 text-white",
    tagline: "Pure Sound. Zero Distraction.",
    description:
      "Flagship wireless earbuds with intelligent 2x stronger Active Noise Cancellation, Adaptive Audio, Conversation Awareness, and up to 32 hours of immersive battery life.",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    specs: {
      processor: "Nova H2 High-Efficiency Audio Silicon",
      audio: "11mm Custom High-Excursion Driver + High Dynamic Amplifier",
      battery: "8h per charge · 32h with wireless charging case",
      batteryHours: 32,
      connectivity: "Bluetooth 5.4 · Multi-device Auto-Switch · LE Audio",
      build: "Ergonomic silicone ear tips (XS, S, M, L) · Matte case",
      weight: "5.3g per bud · 50.8g case",
      charging: "MagSafe · Qi Wireless · USB-C Fast Charge",
      waterResistance: "IP54 dust, sweat, and water resistant",
      warranty: "1-Year Novatek Standard Warranty",
    },
    features: [
      "Adaptive Audio blends ANC & Transparency dynamically",
      "Personalized Spatial Audio with dynamic head tracking",
      "Touch sensor volume controls on stems",
      "Precision finding with built-in case speaker",
    ],
  },
  {
    id: "novabook-air-m2",
    name: "NovaBook Air M2",
    category: "Laptops",
    price: 1299,
    originalPrice: 1399,
    rating: 4.9,
    reviewCount: 1890,
    trustScore: 99,
    badge: "Editor's Choice",
    badgeColor: "bg-purple-600 text-white",
    tagline: "Strikingly Thin. Blazingly Fast.",
    description:
      "Redesigned around the M2 chip, NovaBook Air delivers unbelievable speed and up to 18 hours of battery life inside a whisper-quiet, fanless aluminum enclosure.",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    specs: {
      processor: "M2 Octa-Core CPU · 10-Core GPU · 16-Core Neural Engine",
      display: "15.3\" Liquid Retina (2880 x 1864) 500 nits P3 Color",
      battery: "Up to 18 hours wireless streaming · 66.5W battery",
      batteryHours: 18,
      connectivity: "Wi-Fi 6E (802.11ax) · Bluetooth 5.3 · MagSafe 3",
      build: "100% Recycled CNC Aluminum Unibody (11.5mm thin)",
      weight: "1.51 kg (3.3 lbs)",
      storage: "512GB PCIe Gen4 NVMe SSD (Configurable to 2TB)",
      ports: "MagSafe 3 · 2x Thunderbolt / USB 4 · 3.5mm Headphone Jack",
      audio: "Six-speaker sound system with force-cancelling woofers",
      camera: "1080p FaceTime HD camera with advanced computational video",
      warranty: "2-Year Novatek AppleCare-style Warranty",
    },
    features: [
      "Fanless silent acoustic architecture under heavy workloads",
      "MagSafe fast-charging breakaway cable",
      "Three-mic array with directional beamforming",
      "Backlit Magic Keyboard with Touch ID biometric security",
    ],
  },
  {
    id: "novawatch-x",
    name: "NovaWatch X",
    category: "Wearables",
    price: 249,
    originalPrice: 299,
    rating: 4.7,
    reviewCount: 3800,
    trustScore: 95,
    badge: "Sale",
    badgeColor: "bg-emerald-600 text-white",
    tagline: "Smarter Health. Ultimate Endurance.",
    description:
      "Precision-crafted with a titanium sports bezel, sapphire glass, always-on AMOLED display, comprehensive ECG / SpO2 tracking, and up to 7-day battery life.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    specs: {
      processor: "Dual-Core S9 SiP with Neural Bio-Engine",
      display: "1.96\" Ultra-Bright Always-On AMOLED (1000 nits peak)",
      battery: "7-day battery life typical · 36h in high-precision GPS mode",
      batteryHours: 168,
      connectivity: "Bluetooth Calling · Dual-Frequency L1/L5 GPS · NFC",
      build: "Aerospace Titanium Bezel · Sapphire Crystal Glass Face",
      weight: "48g (without strap)",
      waterResistance: "50m Water Resistant (Swimproof) · IP68 certified",
      charging: "Magnetic Fast Wireless Charger (0-80% in 45 mins)",
      warranty: "1-Year Novatek Hardware Warranty",
    },
    features: [
      "On-demand ECG generation & SpO2 blood oxygen sensor",
      "Over 120 professional fitness & workout detection algorithms",
      "Bluetooth calling with noise-canceling dual microphones",
      "Crash detection and emergency SOS satellite messaging",
    ],
  },
  {
    id: "novasound-max",
    name: "NovaSound Max Studio Over-Ear",
    category: "Audio",
    price: 349,
    originalPrice: 399,
    rating: 4.9,
    reviewCount: 1150,
    trustScore: 99,
    badge: "Flagship",
    badgeColor: "bg-blue-600 text-white",
    tagline: "Acoustic Perfection. Mastered For Pros.",
    description:
      "The ultimate over-ear headphone experience with 40mm custom beryllium drivers, 45dB hybrid ANC, high-resolution LDAC lossless streaming, and 50 hours of battery life.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    specs: {
      audio: "40mm Custom Beryllium Acoustic Drivers with Neodymium magnets",
      battery: "50 hours playback with ANC on · 65 hours ANC off",
      batteryHours: 50,
      connectivity: "Bluetooth 5.4 · LDAC / aptX Lossless · 3.5mm · USB-C Audio",
      build: "Acoustically engineered memory foam · Stainless steel telescoping arms",
      weight: "265g (Ultra-plush comfort)",
      charging: "USB-C Quick Charge (5-minute charge yields 5 hours playtime)",
      waterResistance: "Sweat resistant IPX4",
      warranty: "2-Year Novatek Pro Warranty",
    },
    features: [
      "45dB Hybrid Adaptive Noise Cancellation with 8 studio mics",
      "Zero-distortion 24-bit/96kHz Hi-Res Lossless Audio certified",
      "Multipoint connectivity pairs simultaneously with laptop and phone",
      "Premium magnetic replaceable memory foam ear cushions",
    ],
  },
  {
    id: "novapower-gan-120w",
    name: "NovaPower GaN 120W Hub",
    category: "Accessories",
    price: 79,
    originalPrice: 99,
    rating: 4.8,
    reviewCount: 2600,
    trustScore: 97,
    badge: "Sale",
    badgeColor: "bg-emerald-600 text-white",
    tagline: "Pocket-Sized Powerhouse. Charge 4 Devices.",
    description:
      "Powered by GaN III semiconductor technology, offering blazing 120W total output across 3 USB-C ports and 1 USB-A port with active intelligent thermal guard.",
    image:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    specs: {
      processor: "GaN III Semiconductor Controller with ActiveGuard 2.0",
      charging: "120W Max total output · Single port USB-C up to 100W PD 3.1",
      ports: "3x USB-C (PD 3.1 / PPS / QC 4+) + 1x USB-A (22.5W QC 3.0)",
      weight: "195g (Ultra compact with foldable AC prongs)",
      connectivity: "Universal 100V-240V worldwide travel voltage support",
      build: "Flame-retardant polycarbonate with heat-dissipating graphite sheet",
      warranty: "18-Month Novatek Replacement Warranty",
    },
    features: [
      "Simultaneously fast charges MacBook Pro, iPhone, and iPad at full speed",
      "Dynamic power reallocation automatically detects connected device requirements",
      "Foldable wall prongs for effortless everyday carry and travel",
      "Certified safe against over-voltage, short-circuit, and overheating",
    ],
  },
  {
    id: "novacam-360-ai",
    name: "NovaCam 360 AI Smart Security",
    category: "Smart Home",
    price: 149,
    originalPrice: 179,
    rating: 4.6,
    reviewCount: 1430,
    trustScore: 94,
    badge: "New",
    badgeColor: "bg-blue-600 text-white",
    tagline: "Intelligent Vision. Complete Peace of Mind.",
    description:
      "4K HDR smart home security camera featuring 360° pan/tilt motion tracking, starlight color night vision, edge AI recognition, and zero-subscription local storage.",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    specs: {
      camera: "4K UHD (3840 x 2160) with F1.6 Starlight Color Night Vision Sensor",
      connectivity: "Dual-Band Wi-Fi 6 (2.4GHz / 5GHz) · Apple HomeKit / Google / Alexa",
      storage: "On-device MicroSD up to 512GB + Optional End-to-End Cloud Backup",
      audio: "Two-way talk with dual beamforming noise-cancelling mics",
      build: "Matte ceramic-style housing with motorized dual-axis gimbal",
      weight: "310g",
      warranty: "2-Year Novatek Warranty",
    },
    features: [
      "On-device neural network recognizes people, pets, and package deliveries",
      "360° mechanical pan and 110° tilt eliminates all room blind spots",
      "Physical privacy shutter slides over lens when home mode is active",
      "Instant push alert with snapshot upon detected motion or glass break audio",
    ],
  },
  {
    id: "novapad-ultra-12",
    name: "NovaPad Ultra 12 Pro",
    category: "Tablets",
    price: 799,
    originalPrice: 899,
    rating: 4.8,
    reviewCount: 920,
    trustScore: 97,
    badge: "Best Seller",
    badgeColor: "bg-amber-600 text-white",
    tagline: "Limitless Canvas. Pure Inspiration.",
    description:
      "12.4-inch OLED 120Hz display with ultra-low latency stylus response, powerful octa-core performance, and all-day creative battery life.",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    specs: {
      processor: "Nova Octa-Core AI Matrix with 12GB Unified Memory",
      display: "12.4\" Ultra OLED (2800 x 1752) 120Hz HDR10+ 600 nits",
      battery: "10,200mAh Battery · 45W Super Fast Charging",
      batteryHours: 15,
      connectivity: "Wi-Fi 7 · 5G Optional · Bluetooth 5.4 · USB-C 3.2 DisplayPort",
      build: "Aero-grade aluminum chassis · 5.8mm razor-thin profile",
      weight: "520g",
      storage: "256GB / 512GB UFS 4.0",
      warranty: "1-Year Novatek Hardware Warranty",
    },
    features: [
      "Magnetic NovaPencil Gen 2 with 4096 levels of pressure and tilt sensitivity",
      "Quad-speaker array tuned by Novatek Acoustic Labs with Dolby Atmos",
      "Multi-window desktop mode with external 4K monitor support",
      "Ultra-wide front camera with auto-framing Center Stage video calls",
    ],
  },
];

export const PROMO_CODES: Record<string, { discountPercent: number; description: string }> = {
  NOVATEK10: { discountPercent: 10, description: "10% off your entire order" },
  HACKATHON20: { discountPercent: 20, description: "20% PayPal AI Hackathon discount" },
  WELCOME15: { discountPercent: 15, description: "15% off first-time purchase" },
};
