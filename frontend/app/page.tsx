"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AgentTrace from "@/components/AgentTrace";
import CartPanel from "@/components/CartPanel";
import DecisionMatrix from "@/components/DecisionMatrix";
import InsightsPanel from "@/components/InsightsPanel";
import { ApiError, api } from "@/lib/api";
import type { CreatedOrder, Insights, Order, SearchResult } from "@/lib/types";

const SESSION_KEY = "smartcart_session_id";
const EXAMPLES = [
  { label: "🎧 boAt Headphones under ₹2000", query: "boAt Rockerz headphones under 2000" },
  { label: "⚡ 65W GaN Charger under ₹2500", query: "65W GaN charger under 2500" },
  { label: "🎒 Laptop Backpack under ₹2000", query: "laptop backpack under 2000" },
  { label: "⌨️ Cosmic Byte Mechanical Keyboard", query: "Cosmic Byte mechanical keyboard under 3000" },
];

export const TOP_DEALS = [
  {
    id: "deal-boat-480",
    name: "boAt Rockerz 480 ANC Wireless Headphones",
    store: "Flipkart",
    category: "headphones",
    price: 1899,
    original_price: 3990,
    rating: 4.5,
    reviews_count: 1240,
    trust_score: 94,
    discount_pct: 52,
    badge: "52% OFF",
    highlight: "Active Noise Cancellation · 30h Battery · 40mm Drivers",
    image_url:
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTx77ytcs2LUuKDE2wewZHFhzGjGcZxDLCdGZ5nt0Tuec3mbEH46PFdvPDSIIN0lWbVT7JjIUlV0NVOPzLTo91fb_NwCRBA7lKpOmhL3L92Y2qKTHqqyS_Cnw",
  },
  {
    id: "deal-ambrane-65w",
    name: "Ambrane 65W GaN Fast Charger (3 Ports)",
    store: "Amazon.in",
    category: "charger",
    price: 1799,
    original_price: 3499,
    rating: 4.6,
    reviews_count: 890,
    trust_score: 96,
    discount_pct: 49,
    badge: "49% OFF",
    highlight: "GaN Fast Charge · 2x Type-C + 1x USB-A · Laptop & Phone",
    image_url:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "deal-cosmic-firefly",
    name: "Cosmic Byte Firefly RGB Mechanical Keyboard",
    store: "Amazon.in",
    category: "keyboard",
    price: 2199,
    original_price: 3999,
    rating: 4.4,
    reviews_count: 2150,
    trust_score: 91,
    discount_pct: 45,
    badge: "45% OFF",
    highlight: "Outemu Blue Mechanical Switches · RGB Backlit · Compact TKL",
    image_url:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "deal-mokobara-transit",
    name: "Mokobara The Transit Workpack 25L Laptop Bag",
    store: "Croma",
    category: "backpack",
    price: 3999,
    original_price: 6999,
    rating: 4.8,
    reviews_count: 670,
    trust_score: 98,
    discount_pct: 43,
    badge: "43% OFF",
    highlight: "Weatherproof · Dedicated 15.6\" Laptop Pod · Ergonomic Straps",
    image_url:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "deal-noise-pulse3",
    name: "Noise ColorFit Pulse 3 Bluetooth Calling Smartwatch",
    store: "Reliance Digital",
    category: "wearables",
    price: 1499,
    original_price: 4999,
    rating: 4.3,
    reviews_count: 3410,
    trust_score: 93,
    discount_pct: 70,
    badge: "70% OFF",
    highlight: "1.96\" Crisp Display · Bluetooth Calling · 7-Day Battery",
    image_url:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
  },
];

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

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

export default function Home() {
  const [sessionId, setSessionId] = useState("");
  const [query, setQuery] = useState("");
  const [coupon, setCoupon] = useState("");
  const [budgetInput, setBudgetInput] = useState("");

  const [result, setResult] = useState<SearchResult | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pending, setPending] = useState<CreatedOrder | null>(null);

  // Multi-item selection from Top Market Deals
  const [selectedDeals, setSelectedDeals] = useState<string[]>([
    "deal-boat-480",
    "deal-ambrane-65w",
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payStatus, setPayStatus] = useState("");
  const [riskReasons, setRiskReasons] = useState<string[]>([]);

  // One idempotency key per checkout attempt, so a retry never double-charges.
  const idempotencyKey = useRef<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = newId();
      localStorage.setItem(SESSION_KEY, id);
    }
    setSessionId(id);
  }, []);

  const refresh = useCallback(async (sid: string) => {
    try {
      const [i, o] = await Promise.all([api.insights(sid), api.orders(sid)]);
      setInsights(i);
      setOrders(o);
    } catch {
      // Insights are non-critical; keep the page usable if the backend is slow.
    }
  }, []);

  useEffect(() => {
    if (sessionId) refresh(sessionId);
  }, [sessionId, refresh]);

  function toggleDeal(id: string) {
    setSelectedDeals((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function runSearch(text: string) {
    if (!sessionId || !text.trim()) return;
    setLoading(true);
    setError(null);
    setPending(null);
    setApproved(false);
    setPayStatus("");
    setRiskReasons([]);
    try {
      const data = await api.search(sessionId, text.trim(), coupon.trim() || null);
      setResult(data);
      if (data.message) setError(data.message);
      await refresh(sessionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveBudget() {
    if (!sessionId) return;
    const value = budgetInput.trim() === "" ? null : Number(budgetInput);
    if (value !== null && (Number.isNaN(value) || value < 0)) {
      setError("Enter a budget of 0 or more");
      return;
    }
    try {
      await api.setBudget(sessionId, value);
      setError(null);
      await refresh(sessionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save budget");
    }
  }

  async function capturePending(order: CreatedOrder) {
    const captured = await api.capture(order.id);
    setPayStatus(`Payment ${captured.status.toLowerCase()}. Order ${captured.id} for $${captured.total.toFixed(2)}.`);
    setPending(null);
    setApproved(false);
    idempotencyKey.current = null;
    await refresh(sessionId);
  }

  async function pay() {
    if (!approved) return;
    const hasSearchPick = Boolean(result?.top_pick && result?.cart);
    const hasSelectedDeals = selectedDeals.length > 0;
    if (!hasSearchPick && !hasSelectedDeals) return;

    if (!idempotencyKey.current) idempotencyKey.current = newId();

    setPaying(true);
    setPayStatus("Creating PayPal order...");
    setRiskReasons([]);
    try {
      const primaryId = hasSearchPick ? result!.top_pick! : selectedDeals[0];
      const itemsToBuy = hasSearchPick ? undefined : selectedDeals;
      const appliedCoupon = coupon.trim() || (!hasSearchPick && bundleSubtotal >= 499 ? "SAVE10" : null);

      const order = await api.createOrder(
        sessionId,
        primaryId,
        appliedCoupon,
        approved,
        idempotencyKey.current,
        itemsToBuy,
      );
      setPending(order);
      if (order.mock) {
        setPayStatus("Running in mock mode (no PayPal sandbox credentials set).");
        await capturePending(order);
      } else if (order.approve_url) {
        window.open(order.approve_url, "_blank", "noopener");
        setPayStatus("Approve the payment in the PayPal window, then click the button below.");
      } else {
        setPayStatus("PayPal did not return an approval link.");
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setRiskReasons(e.reasons);
        setPayStatus(e.message);
        idempotencyKey.current = null;
      } else {
        setPayStatus(e instanceof Error ? e.message : "Payment failed");
      }
    } finally {
      setPaying(false);
    }
  }

  async function confirmApproved() {
    if (!pending) return;
    setPaying(true);
    try {
      await capturePending(pending);
    } catch (e) {
      setPayStatus(e instanceof Error ? e.message : "Capture failed");
    } finally {
      setPaying(false);
    }
  }

  const budgetNote =
    result?.budget?.exceeded && result.budget.budget !== null
      ? `Your session budget of $${result.budget.budget} is already used up. Suggestions below fit what is left.`
      : undefined;

  // Selected Deals Bundle Calculation
  const selectedItems = TOP_DEALS.filter((d) => selectedDeals.includes(d.id));
  const bundleSubtotal = selectedItems.reduce((acc, d) => acc + d.price, 0);
  const bundleOriginalTotal = selectedItems.reduce((acc, d) => acc + d.original_price, 0);
  const bundleSavings = bundleOriginalTotal - bundleSubtotal;
  const bundleCoupon = bundleSubtotal >= 499 ? { code: "SAVE10", saving: Math.round(bundleSubtotal * 0.1), description: "10% off orders over ₹499" } : null;
  const bundleDiscount = bundleCoupon ? bundleCoupon.saving : 0;
  const bundleShipping = bundleSubtotal - bundleDiscount >= 499 || bundleSubtotal === 0 ? 0 : 49;
  const bundleTotal = bundleSubtotal > 0 ? bundleSubtotal - bundleDiscount + bundleShipping : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <header className="pt-10">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
          SmartCart <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">AI</span>
        </h1>
        <div className="mt-2.5 inline-block">
          <span className="text-lg sm:text-2xl font-black tracking-tight bg-gradient-to-r from-orange-500 via-rose-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-xs">
            &ldquo;Har kharidar ka smart saathi &mdash; SmartCart&rdquo;
          </span>
        </div>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
          Describe what you need in plain English. Autonomous specialist agents discover products across Indian stores, verify review trust, optimize pricing, and check out with PayPal.
        </p>
      </header>

      <form
        className="mt-6 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. boAt Rockerz ANC headphones under ₹2000"
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-brand focus:outline-none"
        />
        <input
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="Coupon (optional)"
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm sm:w-48"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-xl bg-brand px-6 py-3 font-medium text-white shadow-sm disabled:opacity-50"
        >
          {loading ? "Working..." : "Find my best pick"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.query}
            type="button"
            onClick={() => {
              setQuery(ex.query);
              runSearch(ex.query);
            }}
            className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:border-brand hover:bg-brand/5 hover:text-brand transition-all"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-950 shadow-xs animate-pulse">
          <div className="h-5 w-5 rounded-full border-2 border-brand border-t-transparent animate-spin shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-brand-dark">Multi-Agent workflow executing...</p>
            <p className="text-xs text-blue-800">
              Scanning Google Shopping India, comparing merchant prices, and verifying review sentiment.
            </p>
          </div>
        </div>
      )}

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!result && !loading && (
        <section className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs">
                <span>🔥</span> Top 5 Market Deals of Right Now
              </div>
              <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                Curated across India&apos;s Most Reputed Online Stores
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Select items below &mdash; SmartCart automatically bundles them, applies valid coupons, and calculates your total cost live!
              </p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-2 text-xs font-semibold text-brand-dark">
              Stores: Amazon.in &middot; Flipkart &middot; Croma &middot; Reliance Digital
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Deals Grid (8 Columns) */}
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
              {TOP_DEALS.map((deal) => {
                const isSelected = selectedDeals.includes(deal.id);
                return (
                  <article
                    key={deal.id}
                    onClick={() => toggleDeal(deal.id)}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-4 shadow-xs transition-all duration-300 cursor-pointer hover:shadow-lg ${
                      isSelected
                        ? "border-2 border-brand ring-4 ring-brand/10 bg-blue-50/20"
                        : "border-slate-200/90 hover:border-brand/40"
                    }`}
                  >
                    <div>
                      {/* Top Bar on Card */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-700 shadow-2xs border border-slate-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          {deal.store}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                            {deal.badge}
                          </span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by card click
                            className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Product Image */}
                      <div className="relative mt-2 h-44 w-full overflow-hidden rounded-xl bg-slate-50/60 p-3 flex items-center justify-center">
                        <img
                          src={deal.image_url}
                          alt={deal.name}
                          className="max-h-full max-w-full object-contain filter drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>

                      {/* Title & Info */}
                      <h3 className="mt-3 font-bold text-slate-900 leading-snug line-clamp-2 text-sm" title={deal.name}>
                        {deal.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-1">{deal.highlight}</p>

                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="font-semibold text-amber-600">★ {deal.rating}</span>
                        <span className="text-slate-400">&middot;</span>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 border border-emerald-200 text-[11px]">
                          Trust {deal.trust_score}/100
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-xl font-black text-slate-900">{money(deal.price)}</span>
                          <span className="ml-2 text-xs text-slate-400 line-through">{money(deal.original_price)}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-700">
                          Save {money(deal.original_price - deal.price)}
                        </span>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDeal(deal.id);
                          }}
                          className={`w-full rounded-xl py-2 text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-brand text-white shadow-xs"
                              : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                          }`}
                        >
                          {isSelected ? "✓ In SmartCart" : "+ Select Item"}
                        </button>
                        <button
                          type="button"
                          title="Ask agents to analyze this deal"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuery(deal.name);
                            runSearch(deal.name);
                          }}
                          className="rounded-xl border border-slate-200 px-2.5 text-xs text-slate-600 hover:border-brand hover:text-brand"
                        >
                          🔍
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* SmartCart Total Cost Calculator (4 Columns) */}
            <aside className="lg:col-span-4 lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-2xl border-2 border-brand/40 bg-white p-5 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">SmartCart</h3>
                    <p className="text-xs text-slate-500">Live Cost Calculator</p>
                  </div>
                  <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-black text-brand">
                    {selectedDeals.length} Item(s) Selected
                  </span>
                </div>

                {selectedItems.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500">
                    <p>Select any deals from the left to calculate your total cost live.</p>
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    {/* Item list */}
                    <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50/80 p-2 border border-slate-100 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={item.image_url} alt={item.name} className="h-8 w-8 object-contain shrink-0 rounded-md bg-white border border-slate-200 p-0.5" />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-800">{item.name}</p>
                              <p className="text-[10px] text-slate-500">{item.store}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-bold text-slate-900">{money(item.price)}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDeal(item.id);
                              }}
                              className="text-slate-400 hover:text-red-600 font-bold px-1"
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cost Calculation */}
                    <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Original Total</span>
                        <span className="line-through">{money(bundleOriginalTotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700 font-medium">
                        <span>Subtotal</span>
                        <span>{money(bundleSubtotal)}</span>
                      </div>
                      {bundleCoupon && (
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Coupon {bundleCoupon.code} (10% OFF)</span>
                          <span>-{money(bundleDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600">
                        <span>Delivery</span>
                        <span>{bundleShipping === 0 ? "FREE" : money(bundleShipping)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-black text-slate-900">
                        <span>Total Cost</span>
                        <span className="text-xl text-brand-dark">{money(bundleTotal)}</span>
                      </div>

                      {bundleSavings > 0 && (
                        <div className="rounded-lg bg-emerald-50 px-2.5 py-1 text-center font-bold text-emerald-800 text-xs border border-emerald-200">
                          🎉 Total Savings Today: {money(bundleSavings + bundleDiscount)}
                        </div>
                      )}

                      {bundleTotal >= 30 && (
                        <div className="mt-2 rounded-lg bg-blue-50/90 border border-blue-100 px-3 py-1.5 text-[11px] text-blue-900 flex items-center justify-between">
                          <span>or 4 interest-free payments of <strong>{money(Math.round(bundleTotal / 4))}</strong></span>
                          <span className="font-bold text-[#003087]">Pay in 4</span>
                        </div>
                      )}
                    </div>

                    {/* Checkout Approval */}
                    <label className="mt-3 flex items-start gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                        checked={approved}
                        onChange={(e) => setApproved(e.target.checked)}
                      />
                      <span>I approve paying {money(bundleTotal)} for these {selectedItems.length} item(s).</span>
                    </label>

                    {/* PayPal Button */}
                    <div className="mt-3 space-y-2">
                      <button
                        type="button"
                        onClick={pay}
                        disabled={!approved || paying || selectedItems.length === 0}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#ffc439] hover:bg-[#f4bb34] px-4 py-3 font-black text-[#003087] shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.784.784 0 0 1 .773-.66h7.79c3.125 0 5.433 1.34 6.098 4.22.428 1.85-.027 3.65-1.328 4.96-1.35 1.357-3.374 1.93-5.748 1.93H9.79l-1.05 6.643a.64.64 0 0 1-.634.524h-.03z" fill="#003087"/>
                          <path d="M9.79 14.17h2.74c2.374 0 4.398-.573 5.748-1.93 1.3-1.31 1.756-3.11 1.328-4.96-.28-1.21-.97-2.19-2.02-2.88a6.38 6.38 0 0 1-.77 2.37c-.77 1.4-2.18 2.21-3.98 2.21H9.86l-.97 6.13.9-.94z" fill="#0079C1"/>
                        </svg>
                        <span>{paying ? "Connecting to PayPal..." : "Pay with PayPal"}</span>
                      </button>

                      {payStatus && (
                        <p className="text-[11px] text-center text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                          {payStatus}
                        </p>
                      )}

                      <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <svg className="h-3 w-3 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Protected by PayPal Buyer Protection &middot; Zero Duplicate
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>
      )}

      {result && (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setQuery("");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-brand hover:text-brand transition-colors cursor-pointer"
          >
            &larr; Back to Top 5 Market Deals
          </button>
          <span className="text-xs text-slate-500 font-medium">
            Multi-Agent Discovery &amp; Ranking
          </span>
        </div>
      )}

      {result && (
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {result && <AgentTrace steps={result.trace} />}

          {result && result.matrix.length > 0 && (
            <DecisionMatrix
              matrix={result.matrix}
              topPick={result.top_pick}
              alternatives={result.alternatives}
              budgetNote={budgetNote}
              currency={result.cart?.currency ?? "INR"}
            />
          )}
        </div>

        <aside className="space-y-8 lg:sticky lg:top-6 lg:self-start">
          {result?.cart && (
            <CartPanel
              ledger={result.cart}
              approved={approved}
              onApprovedChange={setApproved}
              onPay={pay}
              paying={paying}
              payStatus={payStatus}
              canCapture={Boolean(pending && !pending.mock && pending.status !== "COMPLETED")}
              onCapture={confirmApproved}
              riskReasons={riskReasons}
            />
          )}
          <InsightsPanel
            insights={insights}
            orders={orders}
            budgetInput={budgetInput}
            onBudgetInputChange={setBudgetInput}
            onSetBudget={saveBudget}
          />
        </aside>
      </div>
      )}

      <footer className="mt-16 border-t border-slate-200 pt-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>SmartCart AI &middot; Har kharidar ka smart saathi</span>
        <span>Built for PayPal AI Hackathon 2026</span>
      </footer>
    </div>
  );
}
