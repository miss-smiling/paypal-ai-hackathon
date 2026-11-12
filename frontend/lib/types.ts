export type Retailer = "Amazon" | "Flipkart" | "Croma" | "Reliance Digital";

export type ProductCategory =
  | "Laptops"
  | "Smartphones"
  | "Audio"
  | "Wearables"
  | "Accessories"
  | "Home Appliances";

export interface ProductSpecs {
  processor?: string;
  ram?: string;
  storage?: string;
  display?: string;
  battery?: string;
  camera?: string;
  os?: string;
  weight?: string;
  graphics?: string;
  connectivity?: string;
  warranty?: string;
  seller?: string;
  delivery?: string;
  returnPolicy?: string;
  [key: string]: string | undefined;
}

export interface ReviewSentiment {
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  overallScore: number; // out of 100
  positiveThemes: string[];
  negativeThemes: string[];
  commonComplaints: string[];
  reliabilityScore: number; // e.g., 94% verified purchases
}

export interface PricePoint {
  date: string;
  price: number;
  retailer: Retailer;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number; // in INR
  originalPrice: number; // in INR
  discountPct: number;
  rating: number; // e.g. 4.5
  reviewCount: number;
  retailer: Retailer;
  retailerUrl?: string;
  inStock: boolean;
  deliveryEstimate: string;
  deliveryCharge: number; // 0 for free
  image: string;
  image_url?: string; // backwards compatibility with legacy components
  additionalImages?: string[];
  tagline: string;
  description: string;
  specs: ProductSpecs;
  pros: string[];
  cons: string[];
  aiSummary: string;
  aiVerdict: string;
  sentiment: ReviewSentiment;
  priceHistory: PricePoint[];
  trustScore: number; // 0 - 100
  isBestSeller?: boolean;
  isTrending?: boolean;
}

export interface WatchlistItem {
  id: string;
  productId: string;
  product: Product;
  targetPrice: number;
  priceAlertEnabled: boolean;
  addedAt: string;
  initialPrice: number;
  priceMovement: "down" | "up" | "stable";
  priceDiff: number;
}

export interface PriceAlert {
  id: string;
  productId: string;
  product: Product;
  targetPrice: number;
  initialPrice: number;
  currentPrice: number;
  retailer: Retailer;
  status: "active" | "triggered" | "paused";
  createdAt: string;
  triggeredAt?: string;
}

export interface BudgetExpense {
  id: string;
  productName: string;
  category: ProductCategory;
  amount: number;
  date: string;
  retailer: Retailer;
}

export interface CategoryBudget {
  category: ProductCategory;
  allocated: number;
  spent: number;
  color: string;
}

export interface BudgetPlan {
  id: string;
  name: string;
  totalBudget: number;
  amountSpent: number;
  startDate: string;
  deadline?: string;
  categories: CategoryBudget[];
  expenses: BudgetExpense[];
}

export interface ShoppingHistoryEvent {
  id: string;
  type: "comparison" | "view" | "purchase" | "watchlist" | "chat" | "alert" | "budget";
  title: string;
  description: string;
  timestamp: string;
  link?: string;
  badge?: string;
  meta?: Record<string, unknown>;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  preferredRetailers: Retailer[];
  preferredCategories: ProductCategory[];
  defaultBudget: number;
  shoppingPriorities: string[];
  notifications: {
    priceDrops: boolean;
    dealAlerts: boolean;
    budgetThresholds: boolean;
    weeklyDigest: boolean;
  };
  display: {
    currency: "INR" | "USD";
    layout: "comfortable" | "compact";
  };
}

export interface ChatProductCard {
  id: string;
  name: string;
  price: number;
  rating: number;
  retailer: Retailer;
  badge?: string;
  aiNote: string;
  image: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "cart";
  text: string;
  timestamp: string;
  products?: ChatProductCard[];
  aiVerdict?: string;
  followUps?: string[];
  comparisonSummary?: {
    winner: string;
    reason: string;
    keyPoints: string[];
  };
}

export interface SavedConversation {
  id: string;
  title: string;
  preview: string;
  date: string;
  messages: ChatMessage[];
}

// ----------------------------------------------------
// Backward compatibility types for legacy components
// ----------------------------------------------------
export type MatrixRow = {
  product: Product;
  match_score: number;
  matched: string[];
  missed: string[];
  trust_score: number;
  avg_rating: number | null;
  flagged_reviews: number;
  value_score: number;
  final_score: number;
};

export type Ledger = {
  items: { id: string; name: string; price: number; image_url?: string }[];
  subtotal: number;
  coupon: { code: string; saving: number; description: string } | null;
  discount: number;
  shipping: number;
  total: number;
  currency: string;
};

export type Budget = {
  budget: number | null;
  spent: number;
  remaining: number | null;
  exceeded: boolean;
};

export type SearchResult = {
  intent: {
    category: string | null;
    max_price: number | null;
    attributes: Record<string, unknown>;
    source: string;
    raw: string;
  };
  budget: Budget | null;
  matrix: MatrixRow[];
  top_pick: string | null;
  cart: Ledger | null;
  alternatives: { product: Product; final_score: number }[];
  message: string;
  trace: string[];
};

export type Order = {
  id: string;
  status: string;
  mock: boolean;
  total: number;
  currency: string;
  product_id: string;
  product_name: string;
  risk_level: string;
  risk_reasons: string[];
  replayed?: boolean;
  approve_url?: string | null;
};

export type CreatedOrder = Order & { ledger: Ledger };

export type Insights = {
  session_id: string;
  budget: Budget;
  orders_total: number;
  orders_completed: number;
  spend_by_category: Record<string, number>;
  searches: number;
  currency: string;
};

export type ChatTurn = { role: "user" | "assistant"; text: string };

export type ChatResult = {
  mode: "shop" | "support";
  reply: string;
  search: SearchResult | null;
  orders: Order[] | null;
  trace: string[];
  provider: string;
};
