import type { Product } from "./types";
import type { SmartCartProduct } from "./smartcartData";

const CATEGORY_MAP: Record<string, SmartCartProduct["category"]> = {
  smartphone: "Smartphones",
  headphones: "Audio",
  laptop: "Laptops",
  wearables: "Wearables",
};

// The backend catalog and the storefront data use different shapes. This converts a
// backend product so the existing cart, compare and quick view components can use it.
export function toSmartCartProduct(p: Product, trustScore = 90): SmartCartProduct {
  const s = p.specs as Record<string, string | number | boolean | undefined>;
  const battery = typeof s.battery_h === "number" ? `${s.battery_h} hours` : undefined;
  const features = Object.entries(s)
    .filter(([, v]) => v === true)
    .map(([k]) => k.replace(/_/g, " ").toUpperCase());

  return {
    id: p.id,
    name: p.name,
    brand: p.brand as SmartCartProduct["brand"],
    category: CATEGORY_MAP[p.category] ?? "Accessories",
    price: p.price,
    rating: p.rating,
    reviewCount: 0,
    trustScore,
    tagline: `${p.brand} ${p.category}`,
    description: `${p.name} by ${p.brand}.`,
    image: p.image_url ?? "/avatar.png",
    inStock: true,
    specs: {
      processor: typeof s.processor === "string" ? s.processor : undefined,
      display: typeof s.display === "string" ? s.display : undefined,
      battery,
      batteryHours: typeof s.battery_h === "number" ? s.battery_h : undefined,
      connectivity: s.wireless ? "Wireless" : undefined,
    },
    features,
  };
}
