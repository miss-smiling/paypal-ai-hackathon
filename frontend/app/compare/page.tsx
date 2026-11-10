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

export default function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "deal-boat-480",
    "deal-ambrane-65w",
    "deal-cosmic-firefly",
  ]);

  const comparedProducts = TOP_DEALS.filter((d) => selectedIds.includes(d.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400 mb-2">
          <span>⚖️ Unbiased Spec Match</span>
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Product Spec Comparison</h1>
        <p className="mt-1 text-sm text-slate-400">
          Side-by-side value matrix comparing verified battery, warranty, trust scores, and prices.
        </p>

        {/* Product selector buttons */}
        <div className="mt-5 flex flex-wrap gap-2">
          {TOP_DEALS.map((d) => {
            const active = selectedIds.includes(d.id);
            return (
              <button
                key={d.id}
                onClick={() => {
                  setSelectedIds((prev) =>
                    active ? prev.filter((id) => id !== d.id) : [...prev, d.id]
                  );
                }}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all border ${
                  active
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                {active ? "✓ " : "+ "}
                {d.name.split(" ").slice(0, 3).join(" ")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/80 shadow-2xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/70">
              <th className="p-4 sm:p-6 text-xs font-bold uppercase tracking-wider text-slate-400 min-w-[160px]">
                Features
              </th>
              {comparedProducts.map((p) => (
                <th key={p.id} className="p-4 sm:p-6 min-w-[240px]">
                  <div className="h-28 w-28 rounded-xl bg-slate-900 p-2 flex items-center justify-center overflow-hidden border border-slate-800 mb-3">
                    <img src={p.image_url} alt={p.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <h3 className="font-bold text-white text-sm line-clamp-2">{p.name}</h3>
                  <p className="text-xl font-black text-cyan-300 mt-1">{money(p.price)}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            <tr>
              <td className="p-4 sm:p-6 font-bold text-slate-400">Verified Store</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-4 sm:p-6 font-semibold text-white">
                  <span className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs">
                    {p.store}
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 sm:p-6 font-bold text-slate-400">Review Trust Score</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-4 sm:p-6">
                  <span className="rounded-full bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-400">
                    {p.trust_score}/100 Trust
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 sm:p-6 font-bold text-slate-400">Customer Rating</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-4 sm:p-6 font-semibold text-amber-400">
                  ★ {p.rating} <span className="text-xs text-slate-500">({p.reviews_count} reviews)</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 sm:p-6 font-bold text-slate-400">Core Highlight</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-4 sm:p-6 text-xs text-slate-300 leading-relaxed">
                  {p.highlight}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 sm:p-6 font-bold text-slate-400">Discount</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-4 sm:p-6 font-bold text-cyan-400">
                  {p.discount_pct}% OFF <span className="text-xs text-slate-500 line-through">({money(p.original_price)})</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 sm:p-6 font-bold text-slate-400">PayPal Checkout</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-4 sm:p-6">
                  <Link
                    href="/"
                    className="inline-block rounded-xl bg-[#ffc439] hover:bg-[#f4bb34] px-4 py-2 text-xs font-black text-[#003087] transition-all"
                  >
                    Select in Cart &rarr;
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
