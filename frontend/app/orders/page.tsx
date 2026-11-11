"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ShieldCheck, ArrowRight, ShoppingBag, CheckCircle2 } from "lucide-react";
import { formatINR } from "@/lib/mockData";

export default function OrdersPage() {
  const [orders] = useState([
    {
      id: "ORD-94812",
      date: "Nov 08, 2026",
      name: "Apple iPhone 15 (128GB, Black)",
      retailer: "Flipkart",
      status: "Delivered",
      total: 64999,
      payment: "PayPal Sandbox",
    },
    {
      id: "ORD-82190",
      date: "Oct 25, 2026",
      name: "Sony WH-CH720N Noise Cancelling Headphones",
      retailer: "Amazon",
      status: "Delivered",
      total: 8990,
      payment: "PayPal Sandbox",
    },
    {
      id: "ORD-71932",
      date: "Oct 14, 2026",
      name: "Samsung Galaxy M34 5G",
      retailer: "Amazon",
      status: "Delivered",
      total: 18999,
      payment: "PayPal Sandbox",
    },
  ]);

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
          <Clock className="h-3.5 w-3.5 text-indigo-600" />
          <span>Verified Transactions</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Order History & Warranties
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Track completed transactions, verified receipts, and manufacturer warranties across Amazon and Flipkart orders.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((ord) => (
          <div
            key={ord.id}
            className="saas-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    {ord.id}
                  </span>
                  <span className="text-xs text-slate-300">·</span>
                  <span className="text-xs text-slate-500">{ord.date}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  {ord.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Fulfilled by {ord.retailer} · Payment: {ord.payment}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:justify-end">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>{ord.status}</span>
              </span>
              <div className="text-right">
                <span className="text-lg font-black text-slate-900 block">
                  {formatINR(ord.total)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
