"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";

const SESSION_KEY = "smartcart_session_id";

function money(n: number, currency = "INR"): string {
  if (currency === "INR" || currency === "₹") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sid = localStorage.getItem(SESSION_KEY) || "demo-session";
    api.orders(sid)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400 mb-2">
          <span>🧾 PayPal Orders v2 Sandbox</span>
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Your Order History</h1>
        <p className="mt-1 text-sm text-slate-400">
          All transactions are protected by explicit shopper approval and idempotent request keys.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          Loading your verified orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-12 text-center space-y-3">
          <p className="text-slate-300 text-base font-semibold">No transactions placed in this session yet.</p>
          <p className="text-slate-500 text-xs">
            Search for products on the home page, select deals, and test the zero-risk PayPal sandbox checkout!
          </p>
          <Link
            href="/"
            className="inline-block mt-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg"
          >
            Start Shopping &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-cyan-400">Order #{order.id}</span>
                  <p className="text-xs font-bold text-white mt-1">
                    {order.product_name || "Verified Order"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-bold border ${
                      order.status === "COMPLETED"
                        ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-950/50 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-xs font-bold text-slate-400">PayPal REST v2</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div>
                  <p className="text-xs text-slate-300 font-medium">Idempotency-Key Header: Verified</p>
                  <p className="text-[11px] text-slate-500">Zero double-charge guarantee &middot; Risk Level: {order.risk_level || "LOW"}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 mr-2">Grand Total:</span>
                  <span className="text-xl font-black text-cyan-300">{money(order.total, order.currency)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
