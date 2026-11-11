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

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

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
};
