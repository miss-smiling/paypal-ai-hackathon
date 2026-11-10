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

export default function HomePage() {
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
      // Non-critical; keeps page responsive if backend is cold-starting
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
      setError(e instanceof Error ? e.message : "Search failed. Please check network connection.");
    } finally {
      setLoading(false);
    }
  }

  async function saveBudget() {
    if (!sessionId) return;
    const value = budgetInput.trim() === "" ? null : Number(budgetInput);
    if (value !== null && (Number.isNaN(value) || value < 0)) {
      setError("Enter a budget of ₹0 or more");
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
    setPayStatus(
      `Payment ${captured.status.toLowerCase()}. Order ${captured.id.slice(0, 10)} for ${money(captured.total, captured.currency)}.`
    );
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
    setPayStatus("Connecting to PayPal Orders v2 Sandbox...");
    setRiskReasons([]);
    try {
      const primaryId = hasSearchPick ? result!.top_pick! : selectedDeals[0];
      const appliedCoupon = coupon.trim() || (!hasSearchPick && bundleSubtotal >= 499 ? "SAVE10" : null);

      const order = await api.createOrder(
        sessionId,
        primaryId,
        appliedCoupon,
        approved,
        idempotencyKey.current
      );
      setPending(order);
      if (order.mock) {
        setPayStatus("Mock Sandbox Mode: verified zero-fraud charge simulated.");
        await capturePending(order);
      } else if (order.approve_url) {
        window.open(order.approve_url, "_blank", "noopener");
        setPayStatus("Please approve in the PayPal sandbox popup window, then confirm below.");
      } else {
        setPayStatus("PayPal returned status without approval URL. Capturing directly...");
        await capturePending(order);
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setRiskReasons(e.reasons);
        setPayStatus(e.message);
        idempotencyKey.current = null;
      } else {
        setPayStatus(e instanceof Error ? e.message : "Payment checkout failed");
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
      ? `Your session budget of ${money(result.budget.budget)} has been exceeded. Cheaper alternatives below fit your balance.`
      : undefined;

  // Selected Deals Bundle Calculation
  const selectedItems = TOP_DEALS.filter((d) => selectedDeals.includes(d.id));
  const bundleSubtotal = selectedItems.reduce((acc, d) => acc + d.price, 0);
  const bundleOriginalTotal = selectedItems.reduce((acc, d) => acc + d.original_price, 0);
  const bundleSavings = bundleOriginalTotal - bundleSubtotal;
  const bundleCoupon =
    bundleSubtotal >= 499
      ? {
          code: "SAVE10",
          saving: Math.round(bundleSubtotal * 0.1),
          description: "10% festive discount on orders over ₹499",
        }
      : null;
  const bundleDiscount = bundleCoupon ? bundleCoupon.saving : 0;
  const bundleShipping = bundleSubtotal - bundleDiscount >= 499 || bundleSubtotal === 0 ? 0 : 49;
  const bundleTotal = bundleSubtotal > 0 ? bundleSubtotal - bundleDiscount + bundleShipping : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <header className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-[#07090e] to-slate-950 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>PayPal AI Hackathon 2026</span>
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              SmartCart <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
            </h1>
            <p className="mt-2 text-base sm:text-lg font-medium text-slate-300">
              Autonomous Multi-Agent Commerce Engine
            </p>
            <p className="mt-1 text-sm font-semibold text-cyan-400/90">
              हर खरीदार का स्मार्ट साथी &mdash; <span className="text-slate-400 font-normal">Natural-language discovery, verified reviews sentiment guard, and idempotent PayPal checkout.</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 sm:flex-col sm:items-end">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 shadow-md">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Active Multi-Agent Core</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                LangGraph · Gemini &middot; PayPal v2
              </span>
            </div>
          </div>
        </div>

        {/* Search Input Bar */}
        <form
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query);
          }}
        >
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tell our AI agent what you need (e.g. boAt Rockerz ANC headphones under 2000)..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 pl-11 pr-4 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-500 shadow-inner focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all"
            />
          </div>

          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Coupon (e.g. SAVE10)"
            className="rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 sm:w-44 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:opacity-95 hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Agents Thinking...</span>
              </span>
            ) : (
              <span>Find Best Pick</span>
            )}
          </button>
        </form>

        {/* Example Query Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Quick Searches:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => {
                setQuery(ex.query);
                runSearch(ex.query);
              }}
              className="rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs font-medium text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-colors cursor-pointer"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <div className="mt-6 rounded-2xl bg-red-950/40 border border-red-800/80 p-4 text-sm text-red-200 flex items-center gap-3">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* VIEW 1: TOP 5 INDIAN MARKET DEALS & LIVE BUNDLE CALCULATOR */}
      {!result && (
        <section className="mt-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-0.5 text-xs font-bold text-indigo-400 mb-2">
                <span>🔥 Verified Value Ranking</span>
              </div>
              <h2 className="text-2xl font-black text-white sm:text-3xl">
                Top 5 Indian Market Deals
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Select items below &mdash; SmartCart automatically bundles them, applies valid coupons, and calculates your total cost live!
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 text-xs font-semibold text-slate-300">
              Verified Stores: Amazon.in &middot; Flipkart &middot; Croma &middot; Reliance Digital
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Deals Grid (8 Columns) */}
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
              {TOP_DEALS.map((deal) => {
                const isSelected = selectedDeals.includes(deal.id);
                return (
                  <article
                    key={deal.id}
                    onClick={() => toggleDeal(deal.id)}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-slate-900/90 p-4 shadow-lg transition-all duration-300 cursor-pointer hover:shadow-cyan-500/10 ${
                      isSelected
                        ? "border-cyan-500 ring-2 ring-cyan-500/30 bg-slate-900"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      {/* Deal Header */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-300 border border-slate-700">
                          {deal.store}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            {deal.badge}
                          </span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500"
                          />
                        </div>
                      </div>

                      {/* Deal Image */}
                      <div className="mt-3 relative h-36 w-full rounded-xl bg-slate-950 p-2 flex items-center justify-center overflow-hidden border border-slate-800/80">
                        <img
                          src={deal.image_url}
                          alt={deal.name}
                          className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>

                      <h3 className="mt-3 font-bold text-slate-100 text-sm leading-snug line-clamp-2">
                        {deal.name}
                      </h3>

                      <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">
                        {deal.highlight}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-baseline justify-between">
                      <div>
                        <span className="text-lg font-black text-cyan-300">{money(deal.price)}</span>
                        <span className="ml-2 text-xs text-slate-500 line-through">
                          {money(deal.original_price)}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-800">
                        Trust {deal.trust_score}/100
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Live Interactive Bundle Box (4 Columns) */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>🛒 Smart Bundle Calculator</span>
                  </h3>
                  <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-black text-cyan-400">
                    {selectedDeals.length} Selected
                  </span>
                </div>

                {selectedItems.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Click items on the left to add them to your smart bundle!
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <ul className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar pr-1">
                      {selectedItems.map((item) => (
                        <li key={item.id} className="flex justify-between items-center text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                          <span className="truncate max-w-[170px]">{item.name}</span>
                          <span className="font-bold text-cyan-300">{money(item.price)}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Original Value</span>
                        <span className="line-through">{money(bundleOriginalTotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-300 font-medium">
                        <span>Subtotal</span>
                        <span>{money(bundleSubtotal)}</span>
                      </div>
                      {bundleCoupon && (
                        <div className="flex justify-between text-emerald-400 font-bold">
                          <span>Coupon {bundleCoupon.code} (10% OFF)</span>
                          <span>-{money(bundleDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-400">
                        <span>Delivery</span>
                        <span>{bundleShipping === 0 ? "FREE" : money(bundleShipping)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-2 text-base font-black text-white">
                        <span>Total Bundle Cost</span>
                        <span className="text-xl text-cyan-300">{money(bundleTotal)}</span>
                      </div>

                      {bundleSavings > 0 && (
                        <div className="rounded-xl bg-emerald-950/50 p-2.5 text-center font-bold text-emerald-400 text-xs border border-emerald-500/30">
                          🎉 Total Savings Today: {money(bundleSavings + bundleDiscount)}
                        </div>
                      )}

                      {bundleTotal >= 30 && (
                        <div className="rounded-xl bg-indigo-950/40 border border-indigo-500/30 px-3 py-2 text-[11px] text-indigo-200 flex items-center justify-between">
                          <span>or 4 interest-free payments of <strong>{money(Math.round(bundleTotal / 4))}</strong></span>
                          <span className="font-bold text-indigo-400">Pay in 4</span>
                        </div>
                      )}
                    </div>

                    <label className="mt-3 flex items-start gap-2 text-xs text-slate-300 cursor-pointer rounded-xl bg-slate-800/40 p-2.5 border border-slate-800">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500"
                        checked={approved}
                        onChange={(e) => setApproved(e.target.checked)}
                      />
                      <span>I explicitly approve paying {money(bundleTotal)} with PayPal.</span>
                    </label>

                    <div className="mt-3 space-y-2">
                      <button
                        type="button"
                        onClick={pay}
                        disabled={!approved || paying || selectedItems.length === 0}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#ffc439] hover:bg-[#f4bb34] px-4 py-3 font-black text-[#003087] shadow-lg shadow-amber-500/10 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.784.784 0 0 1 .773-.66h7.79c3.125 0 5.433 1.34 6.098 4.22.428 1.85-.027 3.65-1.328 4.96-1.35 1.357-3.374 1.93-5.748 1.93H9.79l-1.05 6.643a.64.64 0 0 1-.634.524h-.03z" fill="#003087"/>
                          <path d="M9.79 14.17h2.74c2.374 0 4.398-.573 5.748-1.93 1.3-1.31 1.756-3.11 1.328-4.96-.28-1.21-.97-2.19-2.02-2.88a6.38 6.38 0 0 1-.77 2.37c-.77 1.4-2.18 2.21-3.98 2.21H9.86l-.97 6.13.9-.94z" fill="#0079C1"/>
                        </svg>
                        <span>{paying ? "Connecting to PayPal..." : "Pay with PayPal Sandbox"}</span>
                      </button>

                      {payStatus && (
                        <p className="text-xs text-center text-slate-300 bg-slate-800 p-2 rounded-xl border border-slate-700">
                          {payStatus}
                        </p>
                      )}

                      <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <svg className="h-3 w-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Protected by PayPal Buyer Protection &middot; Zero Duplicate
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Insights on Home */}
              <InsightsPanel
                insights={insights}
                orders={orders}
                budgetInput={budgetInput}
                onBudgetInputChange={setBudgetInput}
                onSetBudget={saveBudget}
              />
            </aside>
          </div>
        </section>
      )}

      {/* VIEW 2: MULTI-AGENT PIPELINE SEARCH RESULTS */}
      {result && (
        <section className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setQuery("");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-bold text-cyan-300 shadow-sm hover:border-cyan-500 hover:bg-cyan-500/10 transition-colors cursor-pointer"
            >
              &larr; Back to Top 5 Market Deals
            </button>
            <span className="text-xs text-slate-400 font-medium">
              Multi-Agent Graph Execution Completed
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <AgentTrace steps={result.trace} />

              {result.matrix.length > 0 && (
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
              {result.cart && (
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
        </section>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 pt-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>SmartCart AI &middot; Har kharidar ka smart saathi</span>
        <span>Built for PayPal AI Hackathon 2026 &middot; Production Verified</span>
      </footer>
    </div>
  );
}
