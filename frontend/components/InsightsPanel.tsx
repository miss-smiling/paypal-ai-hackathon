import type { Insights, Order } from "@/lib/types";

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
  const currency = insights?.currency ?? "USD";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-xl shadow-xl space-y-5">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Budget & Activity
      </h2>

      {/* Set Budget Input */}
      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          placeholder="Session budget, e.g. 150"
          value={budgetInput}
          onChange={(e) => onBudgetInputChange(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
        />
        <button
          onClick={onSetBudget}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          Set
        </button>
      </div>

      {budget && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-xs space-y-2">
          <div className="flex justify-between font-medium">
            <span className="text-slate-300">Spent</span>
            <span className="text-slate-100">{money(budget.spent, currency)}</span>
          </div>
          {budget.budget !== null && (
            <>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full transition-all ${budget.exceeded ? "bg-red-500" : "bg-cyan-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className={`text-[11px] ${budget.exceeded ? "text-red-400 font-semibold" : "text-slate-300"}`}>
                {budget.exceeded
                  ? `Over budget by ${money(-(budget.remaining ?? 0), currency)}`
                  : `${money(budget.remaining ?? 0, currency)} remaining of ${money(budget.budget, currency)}`}
              </p>
            </>
          )}
        </div>
      )}

      {insights && (
        <p className="text-xs text-slate-300 border-t border-slate-800/60 pt-3">
          <strong className="text-white">{insights.searches}</strong> search(es) · <strong className="text-white">{insights.orders_completed}</strong> completed order(s)
        </p>
      )}

      {orders.length > 0 && (
        <div className="border-t border-slate-800/60 pt-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Orders
          </h3>
          <ul className="mt-3 divide-y divide-slate-800/50 text-xs">
            {orders.map((o) => (
              <li key={o.id} className="flex justify-between py-2.5">
                <span className="text-slate-200">
                  {o.product_name}
                  <span className="ml-2 text-[10px] text-cyan-400">
                    {o.status}
                    {o.mock ? " (mock)" : ""}
                  </span>
                </span>
                <span className="font-semibold text-slate-100">{money(o.total, o.currency)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
