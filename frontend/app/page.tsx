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
  "Find 65W GaN travel charger under $40",
  "ANC headphones under $250 with 30h battery",
  "Laptop backpack 25L under $80",
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
      // Insights are non-critical; keep the page usable if backend is slow.
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
        idempotencyKey.current
      );
      setPending(order);
      if (order.mock) {
        setPayStatus("Running in mock mode (no PayPal sandbox credentials set).");
        await capturePending(order);
      } else if (order.approve_url) {
        window.open(order.approve_url, "_blank", "noopener");
        setPayStatus("Approve payment in the PayPal window, then click the confirmation button below.");
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="relative flex flex-col justify-between border-b border-slate-800/80 pb-8 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Agentic AI Commerce Engine v2.0
          </div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            SmartCart <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="mt-2 text-base text-slate-400">
            Tell us what you need. We compare, verify, purge fake reviews, and orchestrate optimal checkout.
          </p>
        </div>

        {sessionId && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400 backdrop-blur-md sm:mt-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Session: <code className="font-mono text-slate-200">{sessionId.slice(0, 13)}...</code>
          </div>
        )}
      </header>

      {/* Main Search Controls */}
      <div className="mt-8">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query);
          }}
        >
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Find 65W GaN travel charger under $40..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 pl-12 text-slate-100 placeholder-slate-500 shadow-xl transition-all focus:border-cyan-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Coupon code"
            className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 text-slate-100 placeholder-slate-500 shadow-xl transition-all focus:border-cyan-500/50 focus:outline-none sm:w-48"
          />

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-8 py-4 font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing...
              </span>
            ) : (
              "Find Best Pick"
            )}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Try asking:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setQuery(ex);
                runSearch(ex);
              }}
              className="rounded-full border border-slate-800 bg-slate-900/40 px-3.5 py-1.5 text-xs text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {result && <AgentTrace steps={result.trace} />}

          {result && result.matrix.length > 0 && (
            <DecisionMatrix
              matrix={result.matrix}
              topPick={result.top_pick}
              alternatives={result.alternatives}
              budgetNote={budgetNote}
            />
          )}

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 text-cyan-400">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">No query initiated yet</h3>
              <p className="mt-1 max-w-md text-sm text-slate-400">
                Enter your shopping criteria above or click one of the example prompts to unleash the decision agent.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
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

      <footer className="mt-20 border-t border-slate-800/60 pt-8 text-center text-xs text-slate-500">
        Demo data only. Product listings and customer ratings are simulated for testing. PayPal runs in sandbox/mock mode.
      </footer>
    </div>
  );
}
