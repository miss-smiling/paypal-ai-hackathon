export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  specs: Record<string, unknown>;
  image_url?: string;
};

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
