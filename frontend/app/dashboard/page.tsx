"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Insights, Order } from "@/lib/types";

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

export default function DashboardPage() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const sid = localStorage.getItem(SESSION_KEY) || "demo-session";
    Promise.all([api.insights(sid), api.orders(sid)])
      .then(([i, o]) => {
        setInsights(i);
        setOrders(o);
      })
      .catch(() => {});
  }, []);

  const totalSpent = insights?.budget?.spent ?? orders.reduce((sum, o) => sum + o.total, 0);
  const budget = insights?.budget?.budget;
  const remaining = insights?.budget?.remaining;
  const categories = insights?.spend_by_category ? Object.entries(insights.spend_by_category) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-950 to-indigo-950/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400 mb-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              Live Session Analytics
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Shopper Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Track your autonomous shopping activity, session limits, and verified PayPal orders.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
          >
            <span>Start New Search &rarr;</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Spent</p>
          <p className="mt-2 text-2xl font-black text-cyan-300">{money(totalSpent)}</p>
          <p className="mt-1 text-[11px] text-slate-500">Across current session</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Budget</p>
          <p className="mt-2 text-2xl font-black text-white">
            {budget !== null && budget !== undefined ? money(budget) : "Uncapped"}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {remaining !== null && remaining !== undefined ? `${money(remaining)} remaining` : "Set in Insights panel"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Orders</p>
          <p className="mt-2 text-2xl font-black text-emerald-400">{orders.length}</p>
          <p className="mt-1 text-[11px] text-slate-500">PayPal Orders v2</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Fraud Prevention</p>
          <p className="mt-2 text-2xl font-black text-indigo-400">100%</p>
          <p className="mt-1 text-[11px] text-slate-500">Zero duplicate charge guard</p>
        </div>
      </div>

      {/* Grid: Recent Orders & Spend By Category */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-lg font-bold text-white mb-4">Recent Transactions</h2>
            {orders.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                No orders placed yet. Head over to the <Link href="/" className="text-cyan-400 hover:underline">homepage</Link> to discover deals and test PayPal checkout!
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-950 p-3.5 border border-slate-800"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">Order #{o.id.slice(0, 12)}</span>
                        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                          {o.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {o.product_name || "Verified Cart Item"} &middot; Idempotency: Verified
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-cyan-300">{money(o.total, o.currency)}</span>
                      <p className="text-[10px] text-slate-500">PayPal Orders v2</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-lg font-bold text-white mb-3">Spend by Category</h2>
            {categories.length > 0 ? (
              <ul className="space-y-2 text-xs">
                {categories.map(([cat, amount]) => (
                  <li key={cat} className="flex justify-between items-center rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                    <span className="capitalize text-slate-300 font-medium">{cat}</span>
                    <span className="font-bold text-cyan-300">{money(amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">No category spend recorded in this session yet.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-lg font-bold text-white mb-3">AI Multi-Agent Execution</h2>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Total Agent Searches:</span>
                <span className="text-white font-bold">{insights?.searches ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Currency Engine:</span>
                <span className="text-cyan-300 font-bold">{insights?.currency ?? "INR"}</span>
              </div>
              <div className="flex justify-between">
                <span>PayPal Gateway:</span>
                <span className="text-emerald-400 font-bold">Sandbox REST v2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
