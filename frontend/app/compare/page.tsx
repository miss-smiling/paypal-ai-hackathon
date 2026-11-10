"use client";

import { useState } from "react";
import Link from "next/link";
import { CATALOG_PRODUCTS, type CatalogProduct } from "@/lib/products";
import { api, ApiError } from "@/lib/api";

function money(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ComparePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "deal-boat-480",
    "aq-pro",
    "deal-ambrane-65w",
  ]);
  const [diffOnly, setDiffOnly] = useState(false);
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);

  // Filter products by category for the selector
  const availableProducts =
    selectedCategory === "all"
      ? CATALOG_PRODUCTS
      : CATALOG_PRODUCTS.filter((p) => p.category === selectedCategory);

  const comparedProducts = CATALOG_PRODUCTS.filter((p) => selectedIds.includes(p.id));

  function toggleProduct(id: string) {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) return; // Keep at least one
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 4) {
        // Replace last item
        setSelectedIds([...selectedIds.slice(1), id]);
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    }
  }

  async function handleBuy(product: CatalogProduct) {
    const sid = localStorage.getItem("smartcart_session_id") || `compare-${Date.now()}`;
    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    setCheckingOutId(product.id);
    setCheckoutStatus(`Creating PayPal Sandbox order for ${product.name}...`);

    try {
      const order = await api.createOrder(sid, product.id, "SAVE10", true, idempotencyKey);
      if (order.mock) {
        const captured = await api.capture(order.id);
        setCheckoutStatus(
          `✅ Payment captured! PayPal Sandbox Order #${captured.id.slice(0, 8)} confirmed for ${money(captured.total)}.`
        );
      } else if (order.approve_url) {
        window.open(order.approve_url, "_blank", "noopener");
        setCheckoutStatus("Please approve in PayPal popup, then verify in Orders tab.");
      } else {
        setCheckoutStatus(`Order #${order.id.slice(0, 8)} generated successfully.`);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setCheckoutStatus(`Checkout notice: ${err.message}`);
      } else {
        setCheckoutStatus("Transaction simulated in sandbox test mode.");
      }
    } finally {
      setCheckingOutId(null);
    }
  }

  const categories = [
    { id: "all", label: "All Gadgets" },
    { id: "headphones", label: "Headphones & Audio" },
    { id: "charger", label: "GaN Fast Chargers" },
    { id: "keyboard", label: "Mechanical Keyboards" },
    { id: "backpack", label: "Bags & Workpacks" },
    { id: "wearables", label: "Smartwatches" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-[#07090e] to-indigo-950/40 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400 mb-3">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Multi-Agent Unbiased Comparison</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Compare <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Specs &amp; Value</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl">
              Evaluate real specifications, filtered review trust scores, pricing, and buyer protection side-by-side with zero sponsored bias.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 shadow-md flex items-center gap-3">
              <div className="text-right">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Comparing</span>
                <span className="text-base font-black text-cyan-400">{comparedProducts.length} of 4 Max</span>
              </div>
              <button
                onClick={() => setSelectedIds(["deal-boat-480", "deal-ambrane-65w", "deal-cosmic-firefly"])}
                className="text-xs text-indigo-300 hover:text-white underline cursor-pointer"
              >
                Reset Top 3
              </button>
            </div>

            {/* Difference Highlighter Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-300 select-none">
              <span>Highlight Differences</span>
              <input
                type="checkbox"
                checked={diffOnly}
                onChange={(e) => setDiffOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500"
              />
            </label>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === c.id
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold"
                  : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Product Toggle Selector Chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {availableProducts.map((p) => {
            const active = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleProduct(p.id)}
                className={`flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-medium transition-all border ${
                  active
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm"
                    : "bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span>{p.name.split(" ").slice(0, 3).join(" ")}</span>
                <span className="font-bold opacity-80">{money(p.price)}</span>
                <span className="text-[10px] ml-1">{active ? "✕" : "+"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {checkoutStatus && (
        <div className="rounded-2xl bg-cyan-950/40 border border-cyan-500/30 p-4 text-xs text-cyan-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span>{checkoutStatus}</span>
          </div>
          <button
            onClick={() => setCheckoutStatus(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Side-by-Side Comparison Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/90 shadow-2xl backdrop-blur-md">
        <table className="w-full text-left text-sm text-slate-300 border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60">
              <th className="p-4 sm:p-6 text-xs font-bold uppercase tracking-wider text-slate-400 w-48 sm:w-60 shrink-0">
                Product &amp; Pricing
              </th>
              {comparedProducts.map((p) => (
                <th key={p.id} className="p-4 sm:p-6 min-w-[280px] max-w-[340px] align-top">
                  <div className="flex flex-col h-full justify-between space-y-4">
                    <div>
                      {/* Product Image Card */}
                      <div className="relative h-44 w-full rounded-2xl bg-slate-950 p-3 flex items-center justify-center border border-slate-800 overflow-hidden mb-3 group">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-2.5 left-2.5 rounded-full bg-slate-900/90 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 border border-slate-700">
                          {p.store}
                        </span>
                        {p.value_verdict && (
                          <span className="absolute top-2.5 right-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-indigo-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow-md">
                            ★ {p.value_verdict}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-white text-sm sm:text-base leading-snug line-clamp-2">
                        {p.name}
                      </h3>

                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-cyan-300">{money(p.price)}</span>
                        <span className="text-xs text-slate-500 line-through">{money(p.original_price)}</span>
                        <span className="rounded bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400">
                          {p.badge}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleBuy(p)}
                      disabled={checkingOutId === p.id}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#ffc439] hover:bg-[#f4bb34] px-4 py-2.5 font-black text-xs text-[#003087] shadow-md transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
                    >
                      {checkingOutId === p.id ? "Connecting to PayPal..." : "Buy with PayPal Sandbox"}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/80">
            {/* 1. Review Sentiment & Trust */}
            <tr className="bg-slate-900/40">
              <td colSpan={comparedProducts.length + 1} className="px-4 sm:px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
                1. Review Sentiment &amp; Trust Guard
              </td>
            </tr>
            <tr>
              <td className="p-4 sm:p-6 font-semibold text-slate-400 text-xs">
                Review Trust Score
                <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Algorithm verification (0-100)</span>
              </td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-4 sm:p-6">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-sm font-black px-2.5 py-1 rounded-xl border ${
                        p.trust_score >= 95
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                          : p.trust_score >= 90
                          ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/40"
                          : "bg-amber-950/60 text-amber-300 border-amber-500/40"
                      }`}
                    >
                      {p.trust_score}/100
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {p.trust_score >= 95 ? "Exceptional" : "Verified Authentic"}
                    </span>
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 sm:p-6 font-semibold text-slate-400 text-xs">
                Fake Reviews Pruned
                <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Duplicate 5-star &amp; unverified</span>
              </td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-4 sm:p-6 text-xs text-amber-300 font-medium">
                  🛡️ {p.flagged_reviews} suspicious review(s) filtered out
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 sm:p-6 font-semibold text-slate-400 text-xs">
                Verified Customer Rating
              </td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-4 sm:p-6 font-bold text-amber-400 text-xs">
                  ★ {p.rating} <span className="text-slate-500 font-normal">({p.reviews_count.toLocaleString()} ratings)</span>
                </td>
              ))}
            </tr>

            {/* 2. Technical Specifications */}
            <tr className="bg-slate-900/40">
              <td colSpan={comparedProducts.length + 1} className="px-4 sm:px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
                2. Technical Specifications
              </td>
            </tr>
            <tr>
              <td className="p-4 sm:p-6 font-semibold text-slate-400 text-xs">Key Feature</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-4 sm:p-6 text-xs text-slate-200 font-medium leading-relaxed">
                  {p.specs.key_feature}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 sm:p-6 font-semibold text-slate-400 text-xs">Connectivity &amp; Ports</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-4 sm:p-6 text-xs text-slate-300">
                  {p.specs.connectivity}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 sm:p-6 font-semibold text-slate-400 text-xs">Battery / Power Output</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-4 sm:p-6 text-xs text-cyan-300 font-semibold">
                  {p.specs.battery_or_power}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 sm:p-6 font-semibold text-slate-400 text-xs">Build &amp; Material</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-4 sm:p-6 text-xs text-slate-300">
                  {p.specs.material_or_switch || "Ergonomic Certified Build"}
                </td>
              ))}
            </tr>

            {/* 3. Protection & Delivery */}
            <tr className="bg-slate-900/40">
              <td colSpan={comparedProducts.length + 1} className="px-4 sm:px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
                3. Buyer Protection &amp; Shipping
              </td>
            </tr>
            <tr>
              <td className="p-4 sm:p-6 font-semibold text-slate-400 text-xs">Warranty</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-4 sm:p-6 text-xs text-slate-300">
                  {p.specs.warranty}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 sm:p-6 font-semibold text-slate-400 text-xs">Shipping &amp; Delivery</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-4 sm:p-6 text-xs text-emerald-400 font-semibold">
                  {p.specs.delivery}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 sm:p-6 font-semibold text-slate-400 text-xs">PayPal Protection</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-4 sm:p-6 text-xs text-indigo-300">
                  ✓ Protected by PayPal Buyer Protection &middot; Zero Fraud Liability
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bottom Recommendation Callout */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>💡 Not sure which one fits your routine?</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Ask our AI Shopping Assistant to personalize the decision based on your daily budget and device requirements.
          </p>
        </div>
        <Link
          href="/assistant"
          className="rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all shrink-0"
        >
          Ask AI Assistant &rarr;
        </Link>
      </div>
    </div>
  );
}
