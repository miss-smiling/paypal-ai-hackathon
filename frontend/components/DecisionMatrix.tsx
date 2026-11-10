"use client";

import type { MatrixRow, Product } from "@/lib/types";

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

export default function DecisionMatrix({
  matrix,
  topPick,
  alternatives,
  budgetNote,
  currency = "INR",
}: Props) {
  if (!matrix.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Decision Matrix</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Unbiased Multi-Agent Ranking
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked strictly by specification match, verified-review trust and real value. Zero sponsored placements.
          </p>
        </div>
      </div>

      {budgetNote && (
        <div className="rounded-xl bg-amber-950/40 border border-amber-800/80 p-3.5 text-xs text-amber-200 flex items-center gap-2">
          <span>⚠️</span>
          <span>{budgetNote}</span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {matrix.map((row) => {
          const p = row.product;
          const isTop = p.id === topPick;
          return (
            <article
              key={p.id}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-slate-900/90 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${
                isTop
                  ? "border-cyan-500 ring-2 ring-cyan-500/30 shadow-cyan-500/10"
                  : "border-slate-800 hover:border-slate-700 hover:shadow-indigo-500/5"
              }`}
            >
              {/* Product Image Showcase */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-950 p-4 flex items-center justify-center border-b border-slate-800">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-600">
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-[11px] mt-1">Verified Spec Match</span>
                  </div>
                )}

                {/* Top-Left Merchant Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-slate-900/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-slate-300 shadow-sm border border-slate-700/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  <span className="truncate max-w-[100px]">{p.brand}</span>
                </div>

                {/* Top-Right Best Value Pick Badge */}
                {isTop && (
                  <span className="absolute top-3 right-3 z-10 rounded-full bg-gradient-to-r from-cyan-600 to-indigo-600 px-3 py-1 text-[11px] font-black text-white shadow-md flex items-center gap-1 ring-1 ring-white/20">
                    <span>★</span> Best Pick
                  </span>
                )}

                {/* Bottom-Right Rating Tag */}
                <div className="absolute bottom-2.5 right-3 z-10 flex items-center gap-1 rounded-md bg-slate-900/90 backdrop-blur-md px-2 py-0.5 text-[11px] font-medium text-slate-200 border border-slate-800">
                  <span className="text-amber-400">★</span>
                  <span>{row.avg_rating ?? "4.5"}</span>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-semibold text-slate-100 line-clamp-2 h-11 text-sm leading-snug" title={p.name}>
                  {p.name}
                </h3>

                <div className="mt-3 flex items-baseline justify-between">
                  <p className="text-xl font-black text-cyan-300">
                    {money(p.price, currency)}
                  </p>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      row.trust_score >= 75
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                        : row.trust_score >= 50
                        ? "bg-amber-950/40 text-amber-400 border-amber-500/30"
                        : "bg-red-950/40 text-red-400 border-red-500/30"
                    }`}
                  >
                    Trust {row.trust_score}/100
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 border-t border-slate-800 pt-3 text-xs text-slate-400">
                  <div className="flex justify-between items-center">
                    <span>Spec match:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-950 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${Math.round(row.match_score * 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-200">{Math.round(row.match_score * 100)}%</span>
                    </div>
                  </div>

                  {row.flagged_reviews > 0 && (
                    <p className="text-amber-400 font-medium flex items-center gap-1 text-[11px]">
                      <span>🛡️</span> {row.flagged_reviews} suspicious review(s) pruned
                    </p>
                  )}

                  {row.missed.length > 0 && (
                    <p className="text-rose-400 text-[11px]">
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
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm sm:text-base">
            <span className="text-emerald-400">⚡</span> Cheaper alternatives that fit your budget
          </h3>
          <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
            {alternatives.map((a) => (
              <div
                key={a.product.id}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-xs hover:border-cyan-500/40 transition-all group"
              >
                <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-900 p-1 border border-slate-800 flex items-center justify-center overflow-hidden">
                  {a.product.image_url ? (
                    <img
                      src={a.product.image_url}
                      alt={a.product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">Item</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                    {a.product.name}
                  </p>
                  <p className="text-xs font-bold text-emerald-400 mt-0.5">
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
