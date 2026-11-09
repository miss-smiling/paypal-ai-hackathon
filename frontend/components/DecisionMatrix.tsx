import type { MatrixRow, Product } from "@/lib/types";

function trustTone(score: number): string {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function money(n: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}

type Props = {
  matrix: MatrixRow[];
  topPick: string | null;
  alternatives: { product: Product; final_score: number }[];
  budgetNote?: string;
};

export default function DecisionMatrix({ matrix, topPick, alternatives, budgetNote }: Props) {
  if (!matrix.length) return null;
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Decision matrix</h2>
        <p className="text-sm text-slate-500">
          Ranked by spec match, verified-review trust and value. Not by sponsored placement.
        </p>
      </div>

      {budgetNote && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{budgetNote}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matrix.map((row) => {
          const p = row.product;
          const isTop = p.id === topPick;
          return (
            <article
              key={p.id}
              className={`relative rounded-2xl border bg-white p-4 shadow-sm ${
                isTop ? "border-2 border-brand" : "border-slate-200"
              }`}
            >
              {isTop && (
                <span className="absolute -top-3 right-4 rounded-full bg-brand px-2 py-0.5 text-xs font-medium text-white">
                  Top value match
                </span>
              )}
              <h3 className="font-semibold leading-snug">{p.name}</h3>
              <p className="mt-1 text-xl font-bold">{money(p.price)}</p>
              <p className="text-sm text-slate-500">
                {p.brand} · {row.avg_rating ?? "n/a"}★ from verified buyers
              </p>
              <p className="mt-2 text-sm">Spec match: {Math.round(row.match_score * 100)}%</p>
              <p className={`text-sm font-semibold ${trustTone(row.trust_score)}`}>
                Trust score: {row.trust_score}/100
              </p>
              {row.missed.length > 0 && (
                <p className="mt-1 text-sm text-red-600">
                  Missing: {row.missed.map((m) => m.replace(/_/g, " ")).join(", ")}
                </p>
              )}
              {row.flagged_reviews > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  {row.flagged_reviews} suspicious review(s) removed
                </p>
              )}
            </article>
          );
        })}
      </div>

      {alternatives.length > 0 && (
        <div>
          <h3 className="font-semibold">Cheaper alternatives that fit your budget</h3>
          <ul className="mt-2 list-inside list-disc text-sm text-slate-700">
            {alternatives.map((a) => (
              <li key={a.product.id}>
                {a.product.name} · {money(a.product.price)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
