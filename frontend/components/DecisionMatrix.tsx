import type { MatrixRow, Product } from "@/lib/types";

function trustTone(score: number): string {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
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

type Props = {
  matrix: MatrixRow[];
  topPick: string | null;
  alternatives: { product: Product; final_score: number }[];
  budgetNote?: string;
  currency?: string;
};

export default function DecisionMatrix({ matrix, topPick, alternatives, budgetNote, currency = "INR" }: Props) {
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
              className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
                isTop ? "border-2 border-brand ring-2 ring-brand/10" : "border-slate-200"
              }`}
            >
              {isTop && (
                <span className="absolute top-3 right-3 z-10 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white shadow-md">
                  ★ Top value match
                </span>
              )}
              {p.image_url && (
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <span>{p.brand}</span>
                  <span>•</span>
                  <span className="text-amber-600 font-semibold">{row.avg_rating ?? "n/a"} ★</span>
                </div>
                <h3 className="mt-1 font-semibold leading-snug text-slate-900">{p.name}</h3>
                <div className="mt-2 flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-slate-900">{money(p.price, currency)}</p>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    row.trust_score >= 75 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                    row.trust_score >= 50 ? "bg-amber-50 text-amber-700 border border-amber-200" :
                    "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    Trust {row.trust_score}/100
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Spec match:</span>
                    <span className="font-semibold text-slate-800">{Math.round(row.match_score * 100)}%</span>
                  </div>
                  {row.flagged_reviews > 0 && (
                    <p className="text-amber-700 font-medium">
                      🛡️ {row.flagged_reviews} suspicious review(s) pruned
                    </p>
                  )}
                  {row.missed.length > 0 && (
                    <p className="text-red-600">
                      Missing: {row.missed.map((m) => m.replace(/_/g, " ")).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {alternatives.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-800">Cheaper alternatives that fit your budget</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {alternatives.map((a) => (
              <div
                key={a.product.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs"
              >
                {a.product.image_url && (
                  <img
                    src={a.product.image_url}
                    alt={a.product.name}
                    className="h-12 w-12 rounded-lg object-cover border border-slate-100"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{a.product.name}</p>
                  <p className="text-xs font-bold text-emerald-700">{money(a.product.price, currency)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
