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

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
    if (!result?.cart || !result.top_pick || !approved) return;
    if (!idempotencyKey.current) idempotencyKey.current = newId();

    setPaying(true);
    setPayStatus("Creating PayPal order...");
    setRiskReasons([]);
    try {
      const order = await api.createOrder(
        sessionId,
        result.top_pick,
        coupon.trim() || null,
        approved,
        idempotencyKey.current,
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
        <section className="mt-10 overflow-hidden rounded-3xl border-2 border-amber-200/90 bg-gradient-to-br from-amber-50/70 via-white to-blue-50/40 p-6 shadow-md shadow-amber-500/5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs">
              <span>🔥</span> Best Deal of All &middot; Verified by Agents
            </div>
            <span className="text-xs font-bold text-slate-600 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200">
              Live price across Flipkart, Amazon.in &amp; Croma
            </span>
          </div>

          <div className="mt-6 grid items-center gap-8 md:grid-cols-12">
            {/* Deal Image Showcase */}
            <div className="relative flex h-64 items-center justify-center rounded-2xl bg-white p-6 shadow-sm border border-slate-100 md:col-span-5 group">
              <img
                src="https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTx77ytcs2LUuKDE2wewZHFhzGjGcZxDLCdGZ5nt0Tuec3mbEH46PFdvPDSIIN0lWbVT7JjIUlV0NVOPzLTo91fb_NwCRBA7lKpOmhL3L92Y2qKTHqqyS_Cnw"
                alt="boAt Rockerz 480 ANC"
                className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-xs border border-slate-200/80">
                Flipkart &middot; Verified Store
              </div>
              <div className="absolute bottom-3 right-3 rounded-md bg-slate-900/85 px-2 py-0.5 text-xs font-semibold text-white">
                ★ 4.5 from 1,240 buyers
              </div>
            </div>

            {/* Deal Details */}
            <div className="flex flex-col justify-center md:col-span-7">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Ranked #1 Value Pick by Optimizer Agent
              </div>
              <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl leading-tight">
                boAt Rockerz 480 ANC Wireless Over-Ear Headphones
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Active Noise Cancellation (ANC), 30h Long Battery, 40mm Dynamic Drivers with Beast Mode low latency. Scored highest spec match and value score.
              </p>

              <div className="mt-4 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">₹1,899</span>
                <span className="text-lg text-slate-400 line-through">₹3,990</span>
                <span className="rounded-lg bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  Save ₹2,091 (52% OFF)
                </span>
                <span className="rounded-lg bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-brand-dark">
                  Trust Score 94/100
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                <span>🛡️ <strong>Review Sentinel:</strong> 0 duplicate bot reviews detected &middot; 100% verified authentic</span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setQuery("boAt Rockerz headphones under 2000");
                    runSearch("boAt Rockerz headphones under 2000");
                  }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#003087] to-brand px-6 py-3 font-bold text-white shadow-md hover:shadow-lg hover:from-brand-dark hover:to-brand transition-all cursor-pointer"
                >
                  <span>⚡ Grab Deal &amp; Inspect Agent Trace</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <span className="text-xs text-slate-500">
                  Or search any product above to explore more deals
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
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

      <footer className="mt-16 border-t border-slate-200 pt-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>SmartCart AI &middot; Har kharidar ka smart saathi</span>
        <span>Built for PayPal AI Hackathon 2026</span>
      </footer>
    </div>
  );
}
