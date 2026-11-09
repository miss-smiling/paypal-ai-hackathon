import type { Insights, Order } from "@/lib/types";

function money(n: number, currency = "USD"): string {
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
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Budget and spending</h2>

      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          placeholder="Session budget, e.g. 150"
          value={budgetInput}
          onChange={(e) => onBudgetInputChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          onClick={onSetBudget}
          className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white"
        >
          Set
        </button>
      </div>

      {budget && (
        <div className="text-sm">
          <div className="flex justify-between">
            <span>Spent</span>
            <span>{money(budget.spent, currency)}</span>
          </div>
          {budget.budget !== null && (
            <>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-2 ${budget.exceeded ? "bg-red-500" : "bg-brand"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className={`mt-1 ${budget.exceeded ? "text-red-600" : "text-slate-600"}`}>
                {budget.exceeded
                  ? `Over budget by ${money(-(budget.remaining ?? 0), currency)}`
                  : `${money(budget.remaining ?? 0, currency)} remaining of ${money(budget.budget, currency)}`}
              </p>
            </>
          )}
        </div>
      )}

      {insights && (
        <p className="text-sm text-slate-600">
          {insights.searches} search(es) · {insights.orders_completed} completed order(s)
        </p>
      )}

      {orders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold">Orders</h3>
          <ul className="mt-2 divide-y divide-slate-100 text-sm">
            {orders.map((o) => (
              <li key={o.id} className="flex justify-between py-2">
                <span>
                  {o.product_name}
                  <span className="ml-2 text-xs text-slate-500">
                    {o.status}
                    {o.mock ? " (mock)" : ""}
                  </span>
                </span>
                <span>{money(o.total, o.currency)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
