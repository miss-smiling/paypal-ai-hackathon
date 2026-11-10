
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

  const currency = insights?.currency ?? "USD";

  return (
    <section
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      style={{ colorScheme: "light", color: "#1e293b" }}
    >
      <h2
        className="text-lg font-semibold"
        style={{ color: "#111827" }}
      >
        Budget and spending
      </h2>

      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          placeholder="Session budget, e.g. 150"
          value={budgetInput}
          onChange={(e) => onBudgetInputChange(e.target.value)}
          style={{
            backgroundColor: "#ffffff",
            color: "#111827",
            colorScheme: "light",
          }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand focus:outline-none"
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
          <div
            className="flex justify-between"
            style={{ color: "#475569" }}
          >
            <span>Spent</span>
            <span>{money(budget.spent, currency)}</span>
          </div>

          {budget.budget !== null && (
            <>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-2 ${
                    budget.exceeded ? "bg-red-500" : "bg-brand"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <p
                className="mt-1"
                style={{
                  color: budget.exceeded ? "#dc2626" : "#475569",
                }}
              >
                {budget.exceeded
                  ? `Over budget by ${money(
                      -(budget.remaining ?? 0),
                      currency
                    )}`
                  : `${money(
                      budget.remaining ?? 0,
                      currency
                    )} remaining of ${money(budget.budget, currency)}`}
              </p>
            </>
          )}
        </div>
      )}

      {insights && (
        <p className="text-sm" style={{ color: "#475569" }}>
          {insights.searches} search(es) · {insights.orders_completed} completed
          order(s)
        </p>
      )}

      {orders.length > 0 && (
        <div>
          <h3
            className="text-sm font-semibold"
            style={{ color: "#111827" }}
          >
            Orders
          </h3>

          <ul className="mt-2 divide-y divide-slate-100 text-sm">
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex justify-between gap-3 py-2"
              >
                <span
                  className="min-w-0"
                  style={{ color: "#374151" }}
                >
                  {o.product_name}

                  <span
                    className="ml-2 text-xs"
                    style={{ color: "#64748b" }}
                  >
                    {o.status}
                    {o.mock ? " (mock)" : ""}
                  </span>
                </span>

                <span
                  className="shrink-0"
                  style={{ color: "#374151" }}
                >
                  {money(o.total, o.currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

