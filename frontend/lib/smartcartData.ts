export interface SmartCartProduct {
  id: string;
  name: string;
  brand: "Apple" | "Samsung" | "Google" | "OnePlus" | "Xiaomi" | "Realme";
  category: "Smartphones" | "Audio" | "Laptops" | "Wearables" | "Accessories";
  price: number;
  originalPrice?: number;
  discountPct?: number;
  rating: number;
  reviewCount: number;
  trustScore: number;
  badge?: "Best Seller" | "New Arrival" | "Sale" | "Trending" | "Limited";
  badgeColor?: string;
  tagline: string;
  description: string;
  image: string;
  colorName?: string;
  storageOption?: string;
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
    charging?: string;
    waterResistance?: string;
    warranty?: string;
    ports?: string;
  };
  features: string[];
}

export interface BrandInfo {
  id: string;
  name: "Apple" | "Samsung" | "Google" | "OnePlus" | "Xiaomi" | "Realme";
  logoText: string;
  count: number;
}

export const BRANDS: BrandInfo[] = [
  { id: "apple", name: "Apple", logoText: " Apple", count: 18 },
  { id: "samsung", name: "Samsung", logoText: "SAMSUNG", count: 24 },
  { id: "google", name: "Google", logoText: "Google", count: 12 },
  { id: "oneplus", name: "OnePlus", logoText: "1+ ONEPLUS", count: 9 },
  { id: "xiaomi", name: "Xiaomi", logoText: "mi Xiaomi", count: 15 },
  { id: "realme", name: "Realme", logoText: "realme", count: 11 },
];

export const SMARTCART_PRODUCTS: SmartCartProduct[] = [
  // --- Popular Smartphones (Top Section of Sample) ---
  {
    id: "iphone-16-pro",
    name: "iPhone 16 Pro",
    brand: "Apple",
    category: "Smartphones",
    price: 1199,
    originalPrice: 1299,
    rating: 4.8,
    reviewCount: 2540,
    trustScore: 99,
    badge: "Best Seller",
    badgeColor: "bg-blue-600 text-white",
    storageOption: "256GB",
    colorName: "Titanium Blue",
    tagline: "More Power. More Possibilities.",
    description:
      "The iPhone 16 Pro delivers exceptional performance with the powerful A18 Pro chip, 48MP pro camera system with 5x optical zoom, and a stunning titanium design.",
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    specs: {
      processor: "A18 Pro 3nm (6-core CPU, 6-core GPU, 16-core Neural Engine)",
      display: "6.3\" Super Retina XDR OLED 120Hz ProMotion (2000 nits)",
      battery: "33 hours video playback · 50% in 30 mins",
      batteryHours: 33,
      connectivity: "5G Sub-6/mmWave · Wi-Fi 7 · Bluetooth 5.4 · USB-C 10Gbps",
      build: "Grade 5 Aerospace Titanium · Ceramic Shield Front",
      weight: "199g",
      storage: "256GB / 512GB / 1TB",
      camera: "48MP Fusion + 48MP Ultra-Wide + 12MP 5x Telephoto",
      charging: "MagSafe 25W · Qi2 · USB-C PD 3.0",
      waterResistance: "IP68 (6m depth up to 30 mins)",
      warranty: "2-Year SmartCart Care+ Included",
    },
    features: [
      "Camera Control sensor for instant focal length & exposure adjustment",
      "Action button with customizable multi-agent shortcuts",
      "Spatial audio recording with studio-grade 4-mic array",
      "Console-grade gaming with hardware ray tracing",
    ],
  },
  {
    id: "samsung-galaxy-s24",
    name: "Samsung Galaxy S24",
    brand: "Samsung",
    category: "Smartphones",
    price: 999,
    originalPrice: 1099,
    rating: 4.5,
    reviewCount: 1820,
    trustScore: 97,
    storageOption: "256GB",
    colorName: "Phantom Black",
    tagline: "Galaxy AI is Here. Epic, Just Like That.",
    description:
      "Engineered with Galaxy AI, titanium shield frame, Snapdragon 8 Gen 3 for Galaxy, and a bright 2600-nit Dynamic AMOLED 2X 120Hz display.",
    image:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    specs: {
      processor: "Snapdragon 8 Gen 3 for Galaxy (4nm)",
      display: "6.2\" FHD+ Dynamic AMOLED 2X 1-120Hz (2600 nits peak)",
      battery: "4,000mAh Battery · 25W Fast Charging · Fast Wireless 2.0",
      batteryHours: 28,
      connectivity: "5G Dual SIM · Wi-Fi 6E · Bluetooth 5.3 · NFC",
      build: "Enhanced Armor Aluminum unibody · Gorilla Glass Victus 2",
      weight: "167g",
      storage: "256GB UFS 4.0",
      camera: "50MP Dual Pixel OIS + 10MP 3x Telephoto + 12MP Ultra-Wide",
      charging: "25W Super Fast Charging · 15W Wireless Qi",
      waterResistance: "IP68 water and dust resistant",
      warranty: "1-Year Manufacturer Warranty",
    },
    features: [
      "Circle to Search with Google on any image or text",
      "Live Translate real-time two-way voice interpretation",
      "Generative Edit photo manipulation right on-device",
      "Vision Booster outdoor peak brightness optimization",
    ],
  },
  {
    id: "google-pixel-9",
    name: "Google Pixel 9",
    brand: "Google",
    category: "Smartphones",
    price: 799,
    originalPrice: 849,
    rating: 4.4,
    reviewCount: 1340,
    trustScore: 96,
    storageOption: "128GB",
    colorName: "Obsidian",
    tagline: "Engineered by Google. Built for Gemini AI.",
    description:
      "The all-new Pixel 9 features the Google Tensor G4 processor, 12GB RAM for Gemini Nano, an elevated camera visor, and 7 years of Pixel Drops.",
    image:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    specs: {
      processor: "Google Tensor G4 with Titan M2 security coprocessor",
      display: "6.3\" Actua OLED Display 60-120Hz (2700 nits peak)",
      battery: "4,700mAh Battery · 24+ hour battery life (100h Extreme)",
      batteryHours: 26,
      connectivity: "5G Sub-6 · Wi-Fi 7 · Bluetooth 5.3 · Ultra-Wideband (UWB)",
      build: "Satin finish glass back · Polished aerospace aluminum frame",
      weight: "198g",
      storage: "128GB / 256GB UFS 3.1",
      camera: "50MP Octa PD Main + 48MP Quad PD Ultra-Wide with Macro Focus",
      charging: "Fast charging up to 55% in 30 minutes · Wireless Qi",
      waterResistance: "IP68 water and dust resistance",
      warranty: "1-Year Google Store Warranty",
    },
    features: [
      "Gemini Live built-in multimodal conversational assistant",
      "Add Me camera feature merges photographer into group photos",
      "Magic Editor with generative fill and auto-framing",
      "Satellite SOS emergency communication capability",
    ],
  },
  {
    id: "oneplus-12",
    name: "OnePlus 12",
    brand: "OnePlus",
    category: "Smartphones",
    price: 899,
    originalPrice: 999,
    rating: 4.3,
    reviewCount: 980,
    trustScore: 95,
    storageOption: "256GB",
    colorName: "Flowy Emerald",
    tagline: "Smooth Beyond Belief. 4th Gen Hasselblad Camera.",
    description:
      "Flagship powerhouse with Snapdragon 8 Gen 3, 5400mAh massive battery, 80W SUPERVOOC fast charge, 50W AIRVOOC wireless, and 4th Gen Hasselblad camera.",
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    specs: {
      processor: "Qualcomm Snapdragon 8 Gen 3 (4nm) with Trinity Engine",
      display: "6.82\" 2K 120Hz ProXDR AMOLED with LTPO 4.0 (4500 nits peak)",
      battery: "5,400mAh Dual-Cell Battery · 80W Wired + 50W Wireless",
      batteryHours: 35,
      connectivity: "5G Dual SIM · Wi-Fi 7 · Bluetooth 5.4 · IR Blaster",
      build: "Ceramic-style glass · Aluminum alloy frame · Alert Slider",
      weight: "220g",
      storage: "256GB / 512GB UFS 4.0",
      camera: "50MP Sony LYT-808 + 64MP 3x Periscope Telephoto + 48MP Ultra-Wide",
      charging: "80W SUPERVOOC (1-100% in 30 mins) · 50W AIRVOOC wireless",
      waterResistance: "IP65 certified water spray and dust resistance",
      warranty: "1-Year OnePlus Warranty",
    },
    features: [
      "Aqua Touch technology tracks screen taps even with wet fingers",
      "Dual Cryo-velocity VC cooling chamber for sustained gaming",
      "Hasselblad Portrait Mode with natural bokeh depth rendering",
      "Physical Alert Slider for effortless sound profile switching",
    ],
  },

  // --- Best Deals Section of Sample ---
  {
    id: "iphone-15",
    name: "iPhone 15",
    brand: "Apple",
    category: "Smartphones",
    price: 849,
    originalPrice: 899,
    discountPct: 15,
    rating: 4.7,
    reviewCount: 3240,
    trustScore: 97,
    badge: "Sale",
    badgeColor: "bg-rose-600 text-white",
    storageOption: "128GB",
    colorName: "Blue",
    tagline: "Dynamic Island. 48MP Main Camera. USB-C.",
    description:
      "Features Dynamic Island, 48MP Main camera with 2x Telephoto, color-infused glass back with contoured edges, and universal USB-C charging.",
    image:
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    specs: {
      processor: "A16 Bionic 4nm Chip (6-core CPU, 5-core GPU)",
      display: "6.1\" Super Retina XDR OLED (2000 nits peak outdoor)",
      battery: "Up to 20 hours video playback",
      batteryHours: 20,
      connectivity: "5G Sub-6 · Wi-Fi 6 · Bluetooth 5.3 · USB-C 2.0",
      build: "Color-infused back glass · Aerospace aluminum enclosure",
      weight: "171g",
      storage: "128GB / 256GB",
      camera: "48MP Main + 12MP Ultra-Wide with 2x Telephoto optical zoom",
      charging: "MagSafe 15W · Qi wireless · USB-C fast charge",
      waterResistance: "IP68 rated under IEC standard 60529",
      warranty: "1-Year Apple Warranty",
    },
    features: [
      "Dynamic Island bubbles up alerts and Live Activities",
      "Next-generation portraits with instant focus and depth adjustment",
      "Emergency SOS via satellite and Crash Detection safety tech",
      "USB-C connector charges your iPhone, Mac, and iPad with one cable",
    ],
  },
  {
    id: "samsung-galaxy-s23",
    name: "Samsung Galaxy S23",
    brand: "Samsung",
    category: "Smartphones",
    price: 719,
    originalPrice: 899,
    discountPct: 20,
    rating: 4.5,
    reviewCount: 1650,
    trustScore: 94,
    badge: "Sale",
    badgeColor: "bg-rose-600 text-white",
    storageOption: "128GB",
    colorName: "Lavender",
    tagline: "Nightography. Precision Performance.",
    description:
      "Capture night photos with Nightography, enjoy peak gaming with Snapdragon 8 Gen 2 for Galaxy, and an eco-conscious design using recycled glass.",
    image:
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    specs: {
      processor: "Snapdragon 8 Gen 2 Mobile Platform for Galaxy",
      display: "6.1\" FHD+ Dynamic AMOLED 2X 120Hz (1750 nits)",
      battery: "3,900mAh Battery · Fast Wireless Charging 2.0",
      batteryHours: 22,
      connectivity: "5G Dual SIM · Wi-Fi 6E · Bluetooth 5.3 · NFC",
      build: "Armor Aluminum frame · Corning Gorilla Glass Victus 2",
      weight: "168g",
      storage: "128GB / 256GB UFS 4.0",
      camera: "50MP Wide OIS + 10MP 3x Telephoto + 12MP Ultra-Wide",
      charging: "25W Fast Charging · Wireless PowerShare",
      waterResistance: "IP68 water resistant rating",
      warranty: "1-Year Samsung Limited Warranty",
    },
    features: [
      "Enhanced Nightography algorithm captures vivid nighttime portraits",
      "Adaptive 120Hz refresh rate smoothens scrolling and saves power",
      "Wireless PowerShare charges your Galaxy Watch or earbuds on back of phone",
      "One UI 6 software with extensive customization widgets",
    ],
  },
  {
    id: "google-pixel-8",
    name: "Google Pixel 8",
    brand: "Google",
    category: "Smartphones",
    price: 719,
    originalPrice: 799,
    discountPct: 10,
    rating: 4.4,
    reviewCount: 1190,
    trustScore: 93,
    badge: "Sale",
    badgeColor: "bg-rose-600 text-white",
    storageOption: "128GB",
    colorName: "Hazel",
    tagline: "The helpful phone engineered by Google.",
    description:
      "Powered by Google Tensor G3, featuring Best Take photo merging, Audio Magic Eraser, and a smooth 120Hz Actua display.",
    image:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    specs: {
      processor: "Google Tensor G3 with Titan M2 security coprocessor",
      display: "6.2\" Actua OLED Display 60-120Hz (2000 nits peak)",
      battery: "4,575mAh Battery with Extreme Battery Saver",
      batteryHours: 24,
      connectivity: "5G Sub-6 · Wi-Fi 7 · Bluetooth 5.3 · NFC",
      build: "Polished aluminum frame with matte satin back glass",
      weight: "187g",
      storage: "128GB / 256GB UFS 3.1",
      camera: "50MP Octa PD Main + 12MP Ultra-Wide with Macro Focus",
      charging: "Fast charge 50% in ~30 mins · Fast Qi Wireless",
      waterResistance: "IP68 water and dust protection",
      warranty: "1-Year Google Hardware Warranty",
    },
    features: [
      "Best Take combines multiple group shots into one flawless photo",
      "Audio Magic Eraser reduces background wind and traffic noise in videos",
      "Real Tone captures the nuances of diverse skin tones authentically",
      "7 full years of Android OS and security updates guarantee",
    ],
  },
  {
    id: "oneplus-nord-3",
    name: "OnePlus Nord 3",
    brand: "OnePlus",
    category: "Smartphones",
    price: 599,
    originalPrice: 679,
    discountPct: 12,
    rating: 4.3,
    reviewCount: 882,
    trustScore: 92,
    badge: "Sale",
    badgeColor: "bg-rose-600 text-white",
    storageOption: "256GB",
    colorName: "Tempest Gray",
    tagline: "Pretty much everything you could ask for.",
    description:
      "Flagship MediaTek Dimensity 9000 chipset, 50MP Sony IMX890 sensor with OIS, 80W SUPERVOOC charging, and a 120Hz Super Fluid AMOLED screen.",
    image:
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    specs: {
      processor: "MediaTek Dimensity 9000 (4nm Octa-Core)",
      display: "6.74\" 1.5K 120Hz Super Fluid AMOLED (1450 nits)",
      battery: "5,000mAh Dual-Cell Battery · 80W Fast Charging",
      batteryHours: 26,
      connectivity: "5G Dual SIM · Wi-Fi 6 · Bluetooth 5.3 · NFC",
      build: "2.8D silk glass back · Plastic unibody frame · Alert Slider",
      weight: "193g",
      storage: "256GB UFS 3.1",
      camera: "50MP Sony IMX890 OIS + 8MP Ultra-Wide + 2MP Macro",
      charging: "80W SUPERVOOC fast charger included in box",
      waterResistance: "IP54 splash and dust resistant",
      warranty: "1-Year OnePlus Standard Warranty",
    },
    features: [
      "80W SUPERVOOC charges 1-100% in only 32 minutes",
      "1.5K high-resolution display with ultra-thin 1.46mm bezels",
      "Flagship 50MP Sony IMX890 sensor with optical image stabilization",
      "Up to 16GB RAM with RAM-Vita intelligent app suspension",
    ],
  },

  // --- Ecosystem Companions from Sample (Cart & Details) ---
  {
    id: "airpods-pro-2",
    name: "AirPods Pro 2",
    brand: "Apple",
    category: "Audio",
    price: 249,
    originalPrice: 279,
    rating: 4.8,
    reviewCount: 4120,
    trustScore: 98,
    badge: "Trending",
    storageOption: "USB-C Case",
    colorName: "White",
    tagline: "Rebuilt from the sound up. Adaptive Audio.",
    description:
      "Up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, Personalized Spatial Audio, and up to 30 hours of listening time with the MagSafe Charging Case.",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    specs: {
      processor: "Apple H2 headphone chip, Apple U1 chip in case",
      display: "Acoustic Drivers",
      battery: "6 hours listening on single charge (30 hours with case)",
      batteryHours: 30,
      connectivity: "Bluetooth 5.3 · Multi-device automatic switching",
      build: "Ergonomic silicone ear tips in 4 sizes (XS, S, M, L)",
      weight: "5.3g per earbud · 50.8g case",
      storage: "MagSafe (USB-C) Charging Case with built-in speaker & lanyard loop",
      charging: "MagSafe wireless, Apple Watch charger, Qi, or USB-C",
      waterResistance: "IP54 dust, sweat, and water resistant for AirPods and case",
      warranty: "1-Year Apple Limited Warranty",
    },
    features: [
      "Adaptive Audio blends ANC and Transparency mode automatically",
      "Conversation Awareness lowers volume when you speak to people nearby",
      "Personalized Spatial Audio with dynamic head tracking for 3D theatre sound",
      "Precision Finding in Find My app locate your charging case easily",
    ],
  },
];

export const PROMO_CODES: Record<string, { discountPercent: number; description: string }> = {
  SMART10: { discountPercent: 10, description: "10% off your entire SmartCart order" },
  HACKATHON20: { discountPercent: 20, description: "20% PayPal AI Hackathon discount" },
  WELCOME15: { discountPercent: 15, description: "15% off first-time purchase" },
};
