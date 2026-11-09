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
        <h1 className="text-3xl font-bold tracking-tight">SmartCart AI</h1>
        <p className="mt-1 text-slate-600">
          Tell us what you need. We compare, verify and build your cart, then check out with PayPal.
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

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

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

      <footer className="mt-16 border-t border-slate-200 pt-6 text-xs text-slate-500">
        Demo data only. Brands and reviews are fictional. PayPal runs in mock mode until sandbox
        credentials are configured on the backend.
      </footer>
    </div>
  );
}
