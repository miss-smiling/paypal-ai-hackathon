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

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {matrix.map((row) => {
          const p = row.product;
          const isTop = p.id === topPick;
          return (
            <article
              key={p.id}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isTop ? "border-2 border-brand ring-4 ring-brand/10" : "border-slate-200/80 hover:border-brand/40"
              }`}
            >
              {/* Product Image Showcase */}
              <div className="relative h-52 w-full overflow-hidden bg-gradient-to-b from-slate-50/90 via-white to-slate-50/50 p-4 flex items-center justify-center border-b border-slate-100">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-108"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-300">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs mt-1">Product Photo</span>
                  </div>
                )}

                {/* Top-Left Merchant Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-xs border border-slate-200/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span className="truncate max-w-[100px]">{p.brand}</span>
                </div>

                {/* Top-Right Best Value Pick Badge */}
                {isTop && (
                  <span className="absolute top-3 right-3 z-10 rounded-full bg-gradient-to-r from-[#003087] to-[#0070ba] px-3 py-1 text-xs font-bold text-white shadow-md flex items-center gap-1 ring-2 ring-white">
                    <span>★</span> Best Value Pick
                  </span>
                )}

                {/* Bottom-Right Rating Tag */}
                <div className="absolute bottom-2.5 right-3 z-10 flex items-center gap-1 rounded-md bg-slate-900/80 backdrop-blur-md px-2 py-0.5 text-[11px] font-medium text-white shadow-xs">
                  <span className="text-amber-400">★</span>
                  <span>{row.avg_rating ?? "4.3"}</span>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-semibold leading-snug text-slate-900 line-clamp-2 h-11" title={p.name}>
                  {p.name}
                </h3>

                <div className="mt-3 flex items-baseline justify-between">
                  <p className="text-2xl font-black tracking-tight text-slate-900">
                    {money(p.price, currency)}
                  </p>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    row.trust_score >= 75 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                    row.trust_score >= 50 ? "bg-amber-50 text-amber-700 border border-amber-200" :
                    "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    Trust {row.trust_score}/100
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <div className="flex justify-between items-center">
                    <span>Spec match:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.round(row.match_score * 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-800">{Math.round(row.match_score * 100)}%</span>
                    </div>
                  </div>
                  {row.flagged_reviews > 0 && (
                    <p className="text-amber-700 font-medium flex items-center gap-1">
                      <span>🛡️</span> {row.flagged_reviews} suspicious review(s) pruned
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
        <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50 to-blue-50/40 p-5 shadow-xs">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="text-emerald-600">⚡</span> Cheaper alternatives that fit your budget
          </h3>
          <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
            {alternatives.map((a) => (
              <div
                key={a.product.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs hover:border-brand/40 transition-all hover:shadow-md group"
              >
                <div className="h-14 w-14 shrink-0 rounded-lg bg-slate-50 p-1 border border-slate-100 flex items-center justify-center overflow-hidden">
                  {a.product.image_url ? (
                    <img
                      src={a.product.image_url}
                      alt={a.product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Item</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-brand transition-colors">
                    {a.product.name}
                  </p>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">
                    {money(a.product.price, currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
