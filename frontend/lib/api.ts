import type { CreatedOrder, Insights, Order, SearchResult } from "./types";

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
};
