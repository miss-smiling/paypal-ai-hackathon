"use client";

import type { Insights, Order } from "@/lib/types";

function money(n: number, currency = "INR"): string {
  if (currency === "INR" || currency === "₹") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(n);
}

type Props = {
  insights: Insights | null;
  orders: Order[];
  budgetInput: string;
  onBudgetInputChange: (v: string) => void;
  onSetBudget: () => void;
};

export default function InsightsPanel({
  insights,
  orders,
  budgetInput,
  onBudgetInputChange,
  onSetBudget,
}: Props) {
  const budget = insights?.budget;
  const pct =
    budget?.budget && budget.budget > 0
      ? Math.min(100, Math.round((budget.spent / budget.budget) * 100))
      : 0;

  const currency = insights?.currency ?? "INR";
  const categories = insights?.spend_by_category ? Object.entries(insights.spend_by_category) : [];

  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h2 className="text-base font-bold text-white tracking-wide">Budget &amp; Insights</h2>
        <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-400">
          Session Active
        </span>
      </div>

      <div>
        <label className="text-xs text-slate-400 block mb-1.5 font-medium">Set Session Budget</label>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder="e.g. 5000"
            value={budgetInput}
            onChange={(e) => onBudgetInputChange(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onSetBudget}
            className="rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
      </div>

      {budget && (
        <div className="rounded-xl bg-slate-800/50 p-3.5 border border-slate-800 text-xs sm:text-sm space-y-2">
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Spent:</span>
            <span className="font-bold text-white">{money(budget.spent, currency)}</span>
          </div>

          {budget.budget !== null && (
            <>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950">
                <div
                  className={`h-2 transition-all duration-500 ${
                    budget.exceeded ? "bg-red-500" : "bg-gradient-to-r from-cyan-500 to-indigo-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{pct}% of limit</span>
                <span>Limit: {money(budget.budget, currency)}</span>
              </div>

              {budget.remaining !== null && (
                <div className="flex justify-between text-xs pt-1 border-t border-slate-700/50">
                  <span className="text-slate-400">Remaining:</span>
                  <span
                    className={`font-bold ${
                      budget.remaining < 0 ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {money(budget.remaining, currency)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {categories.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Spend By Category</h3>
          <div className="space-y-1">
            {categories.map(([cat, amount]) => (
              <div key={cat} className="flex justify-between text-xs">
                <span className="text-slate-400 capitalize">{cat}</span>
                <span className="text-cyan-300 font-bold">{money(amount, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights && (
        <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>Total Agent Searches</span>
          <span className="font-bold text-white">{insights.searches}</span>
        </div>
      )}

      {orders.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Orders ({orders.length})</h3>
            <span className="text-[10px] text-slate-500">PayPal Sandbox</span>
          </div>
          <ul className="space-y-2 text-xs">
            {orders.slice(0, 3).map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between rounded-xl bg-slate-950/70 p-2.5 border border-slate-800"
              >
                <div className="min-w-0 pr-2">
                  <p className="truncate font-semibold text-slate-200">{o.product_name || `Order #${o.id.slice(0, 8)}`}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    ID: {o.id.slice(0, 10)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-cyan-300">{money(o.total, o.currency)}</p>
                  <span
                    className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-bold ${
                      o.status === "COMPLETED"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
