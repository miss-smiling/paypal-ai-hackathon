import type { ChatResult, ChatTurn, CreatedOrder, Insights, Order, SearchResult } from "./types";

// Shape of the dicts returned by the backend GET /api/products (app/catalog.py).
// Prices are in USD; the storefront displays INR, so services.ts converts them.
export interface BackendProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  specs?: Record<string, string | number | boolean>;
  rating: number;
  stock?: boolean;
  image_url?: string | null;
}

export interface HealthStatus {
  status: string;
  paypal_configured: boolean;
  version: string;
  live_feed?: { enabled: boolean; provider: string };
}

export interface PlatformStats {
  registered_users: number;
  total_ratings: number;
  average_rating: number;
  has_ratings: boolean;
  timestamp: string;
}

export interface CommunityMessage {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string | null;
  is_bot: boolean;
  content: string;
  parent_id?: string | null;
  parent_preview?: {
    id: string;
    user_name: string;
    content: string;
    is_bot: boolean;
  } | null;
  links: Array<{
    url: string;
    title?: string;
    description?: string;
    image?: string;
    site_name?: string;
  }>;
  images: Array<{
    url: string;
    filename: string;
    size: number;
  }>;
  reported?: boolean;
  created_at: string;
}

export interface StoreItem {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lon: number;
  distance_km: number;
  phone?: string | null;
  opening_hours?: string;
  source: string;
  verified_profile: boolean;
  live_inventory: boolean;
  directions_url: string;
  osm_url: string;
}

export interface StoreSearchResult {
  status: string;
  search_center: {
    lat: number;
    lon: number;
    location_name: string;
    radius_km: number;
  };
  total_stores: number;
  stores: StoreItem[];
  disclaimer: string;
}

export const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  reasons: string[];

  constructor(message: string, status: number, reasons: string[] = []) {
    super(message);
    this.status = status;
    this.reasons = reasons;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = body?.detail;
    if (detail && typeof detail === "object") {
      throw new ApiError(detail.message ?? "Request failed", res.status, detail.reasons ?? []);
    }
    throw new ApiError(typeof detail === "string" ? detail : "Request failed", res.status);
  }
  return body as T;
}

export const api = {
  // Existing endpoints
  search: (sessionId: string, query: string, couponCode: string | null = null) =>
    request<SearchResult>("/api/search", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, query, coupon_code: couponCode }),
    }),

  chat: (sessionId: string, message: string, history: ChatTurn[] = [], couponCode: string | null = null) =>
    request<ChatResult>("/api/assistant/chat", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, message, history, coupon_code: couponCode }),
    }),

  generalChat: (message: string, history: ChatTurn[] = [], sessionId?: string) =>
    request<{ reply: string; provider: string; suggestions: string[] }>("/api/assistant/general-chat", {
      method: "POST",
      body: JSON.stringify({ message, history, session_id: sessionId }),
    }),

  setBudget: (sessionId: string, budget: number | null) =>
    request<{ budget: number | null }>(`/api/sessions/${sessionId}/budget`, {
      method: "PUT",
      body: JSON.stringify({ budget }),
    }),

  createOrder: (
    sessionId: string,
    productId: string | null,
    couponCode: string | null,
    approved: boolean,
    idempotencyKey: string,
    productIds?: string[],
  ) =>
    request<CreatedOrder>("/api/checkout/create-order", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({
        session_id: sessionId,
        product_id: productId,
        product_ids: productIds,
        coupon_code: couponCode,
        approved,
      }),
    }),

  capture: (orderId: string) =>
    request<Order>("/api/checkout/capture", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId }),
    }),

  insights: (sessionId: string) => request<Insights>(`/api/sessions/${sessionId}/insights`),

  orders: (sessionId: string) => request<Order[]>(`/api/sessions/${sessionId}/orders`),

  products: () => request<BackendProduct[]>("/api/products"),

  health: () => request<HealthStatus>("/api/health"),

  // Live Genuine Website Statistics
  getStats: () => request<PlatformStats>("/api/stats"),

  // Genuine User Rating
  submitRating: (token: string, rating: number, comment?: string) =>
    request<{ status: string; rating: any; stats: PlatformStats }>("/api/ratings", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ rating, comment }),
    }),

  getMyRating: (token: string) =>
    request<{ has_rated: boolean; rating: any }>("/api/ratings/my", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Authentication & Phone Verification
  sendOtp: (phoneNumber: string) =>
    request<{ status: string; phone_number: string; demo_otp?: string; message: string }>("/api/auth/otp/send", {
      method: "POST",
      body: JSON.stringify({ phone_number: phoneNumber }),
    }),

  verifyOtp: (phoneNumber: string, otp: string) =>
    request<{ status: string; phone_number: string; message: string }>("/api/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone_number: phoneNumber, otp }),
    }),

  registerUser: (data: {
    email: string;
    full_name: string;
    phone_number: string;
    otp: string;
    password?: string;
    google_id?: string;
  }) =>
    request<{ token: string; user: any; coupon_unlocked: string; message: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  googleAuth: (data: {
    google_id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    phone_number?: string;
    otp?: string;
  }) =>
    request<{ status: string; token?: string; user?: any; coupon_unlocked?: string; message?: string }>(
      "/api/auth/google",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  loginUser: (data: { email?: string; phone_number?: string; password?: string; otp?: string }) =>
    request<{ token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: (token: string) =>
    request<any>("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Public Community Chat
  getCommunityMessages: (limit = 50, beforeId?: string) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (beforeId) params.append("before_id", beforeId);
    return request<CommunityMessage[]>(`/api/community/messages?${params.toString()}`);
  },

  sendCommunityMessage: (
    token: string,
    data: {
      content: string;
      parent_id?: string | null;
      links?: any[];
      images?: any[];
    }
  ) =>
    request<{ status: string; message: CommunityMessage; bot_reply?: CommunityMessage | null }>(
      "/api/community/messages",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      }
    ),

  uploadCommunityImage: (
    token: string,
    data: { filename: string; mime_type: string; data_base64: string }
  ) =>
    request<{ url: string; filename: string; size: number }>("/api/community/upload-image", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  fetchLinkPreview: (url: string) =>
    request<{ url: string; title?: string; description?: string; image?: string; site_name?: string }>(
      "/api/community/link-preview",
      {
        method: "POST",
        body: JSON.stringify({ url }),
      }
    ),

  reportCommunityMessage: (token: string, messageId: string, reason: string) =>
    request<{ status: string; message: string }>(`/api/community/messages/${messageId}/report`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason }),
    }),

  deleteCommunityMessage: (token: string, messageId: string) =>
    request<{ status: string; id: string }>(`/api/community/messages/${messageId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Nearby Physical Store Discovery
  searchNearbyStores: (params: {
    lat?: number;
    lon?: number;
    query?: string;
    category?: string;
    radius_km?: number;
  }) => {
    const p = new URLSearchParams();
    if (params.lat !== undefined) p.append("lat", String(params.lat));
    if (params.lon !== undefined) p.append("lon", String(params.lon));
    if (params.query) p.append("query", params.query);
    if (params.category) p.append("category", params.category);
    if (params.radius_km !== undefined) p.append("radius_km", String(params.radius_km));
    return request<StoreSearchResult>(`/api/stores/search?${p.toString()}`);
  },
};
