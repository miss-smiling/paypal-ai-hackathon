"use client";

import { useState } from "react";
import Link from "next/link";
import { TOP_DEALS } from "../page";

function money(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function WatchlistPage() {
  const [items, setItems] = useState(
    TOP_DEALS.slice(0, 3).map((d) => ({
      ...d,
      targetPrice: Math.round(d.price * 0.9),
      inStock: true,
    }))
  );

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400 mb-2">
          <span>🔔 Price Drop Tracker</span>
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Your Watchlist</h1>
        <p className="mt-1 text-sm text-slate-400">
          SmartCart monitors prices 24/7 across Amazon, Flipkart, and Croma, alerting you before you buy.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-12 text-center space-y-3">
          <p className="text-slate-400 text-sm">Your watchlist is currently empty.</p>
          <Link href="/" className="inline-block text-xs font-bold text-cyan-400 hover:underline">
            &larr; Discover top deals on the home page
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md"
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-950 p-2 flex items-center justify-center border border-slate-800">
                  <img src={item.image_url} alt={item.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                    {item.store}
                  </span>
                  <h3 className="font-bold text-white text-sm sm:text-base mt-1 line-clamp-1">{item.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="font-black text-cyan-300 text-base">{money(item.price)}</span>
                    <span className="text-slate-500 line-through">{money(item.original_price)}</span>
                    <span className="text-emerald-400 font-semibold">{item.badge}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <Link
                  href="/"
                  className="rounded-xl bg-[#ffc439] hover:bg-[#f4bb34] px-4 py-2 text-xs font-bold text-[#003087] transition-all"
                >
                  Checkout with PayPal
                </Link>
                <button
                  onClick={() => removeItem(item.id)}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
