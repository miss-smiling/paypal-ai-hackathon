"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Insights } from "@/lib/types";

const SESSION_KEY = "smartcart_session_id";

function money(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function BudgetPlannerPage() {
  const [budgetVal, setBudgetVal] = useState("5000");
  const [insights, setInsights] = useState<Insights | null>(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sid = localStorage.getItem(SESSION_KEY) || "demo-session";
    api.insights(sid).then(setInsights).catch(() => {});
  }, []);

  async function handleSaveBudget() {
    const sid = localStorage.getItem(SESSION_KEY) || "demo-session";
    const num = Number(budgetVal);
    if (Number.isNaN(num) || num < 0) return;

    setLoading(true);
    try {
      await api.setBudget(sid, num);
      const updated = await api.insights(sid);
      setInsights(updated);
      setSavedMsg("Session budget updated successfully!");
      setTimeout(() => setSavedMsg(""), 3000);
    } catch {
      setSavedMsg("Failed to save budget. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const spent = insights?.budget?.spent ?? 0;
  const currentBudget = insights?.budget?.budget ?? 5000;
  const remaining = currentBudget - spent;
  const pct = currentBudget > 0 ? Math.min(100, Math.round((spent / currentBudget) * 100)) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400 mb-2">
          <span>🛡️ Autonomous Spending Guard</span>
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Budget Planner &amp; Limits</h1>
        <p className="mt-1 text-sm text-slate-400">
          SmartCart guarantees our multi-agent pipeline never recommends or checks out items beyond your approved ceiling.
        </p>
      </div>

      {/* Main Budget Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <span className="text-xs text-slate-400 font-bold uppercase">Allocated Limit</span>
            <p className="text-2xl font-black text-white mt-1">{money(currentBudget)}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <span className="text-xs text-slate-400 font-bold uppercase">Current Spend</span>
            <p className="text-2xl font-black text-cyan-300 mt-1">{money(spent)}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <span className="text-xs text-slate-400 font-bold uppercase">Remaining Balance</span>
            <p className={`text-2xl font-black mt-1 ${remaining < 0 ? "text-red-400" : "text-emerald-400"}`}>
              {money(remaining)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Spend Velocity ({pct}%)</span>
            <span>{pct >= 100 ? "Budget Exhausted" : "Within Safety Threshold"}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                pct >= 100 ? "bg-red-500" : "bg-gradient-to-r from-cyan-500 to-indigo-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Form to update budget */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <label className="text-xs font-bold text-slate-300 block">Update Session Spending Limit (₹)</label>
          <div className="flex gap-3 max-w-md">
            <input
              type="number"
              min={0}
              value={budgetVal}
              onChange={(e) => setBudgetVal(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
            <button
              onClick={handleSaveBudget}
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg disabled:opacity-50"
            >
              {loading ? "Saving..." : "Update Limit"}
            </button>
          </div>
          {savedMsg && <p className="text-xs text-emerald-400 font-medium">{savedMsg}</p>}
        </div>
      </div>

      {/* Cheaper Alternatives Info */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl text-xs text-slate-400 space-y-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>💡 How SmartCart Budget Intelligence Works</span>
        </h3>
        <p>
          When you execute searches on SmartCart, the Budget Intelligence Agent runs in parallel with the Review Trust Agent. If a top-spec product exceeds your remaining limit, the agent automatically surfaces high-value alternative picks that fit neatly within your ceiling without compromising on verified review trust.
        </p>
        <Link href="/" className="inline-block mt-2 font-bold text-cyan-400 hover:underline">
          &rarr; Test Budget Guard on Home
        </Link>
      </div>
    </div>
  );
}
