"use client";

import type { Ledger } from "@/lib/types";

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
  ledger: Ledger;
  approved: boolean;
  onApprovedChange: (v: boolean) => void;
  onPay: () => void;
  paying: boolean;
  payStatus: string;
  canCapture: boolean;
  onCapture: () => void;
  riskReasons: string[];
};

export default function CartPanel({
  ledger,
  approved,
  onApprovedChange,
  onPay,
  paying,
  payStatus,
  canCapture,
  onCapture,
  riskReasons,
}: Props) {
  const currency = ledger.currency || "INR";
  const shipping = ledger.shipping === 0 ? "Free" : money(ledger.shipping, currency);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-base font-bold text-white tracking-wide">SmartCart Ledger</h2>
        </div>
        <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-400">
          {ledger.items.length} {ledger.items.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <div className="space-y-2.5 pb-2">
          {ledger.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-800"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 shrink-0 rounded-lg bg-slate-950 p-1 border border-slate-800 flex items-center justify-center overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium">Item</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-200 text-xs sm:text-sm">{item.name}</p>
                  <p className="text-[11px] text-slate-400">Qty: 1 · Verified Item</p>
                </div>
              </div>
              <span className="shrink-0 font-bold text-cyan-300 text-sm">{money(item.price, currency)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs sm:text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="text-slate-200 font-medium">{money(ledger.subtotal, currency)}</span>
          </div>

          {ledger.coupon ? (
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span className="flex items-center gap-1">
                <span>🏷️ Coupon</span>
                <span className="rounded bg-emerald-500/20 px-1 py-0.5 text-[10px] text-emerald-300">
                  {ledger.coupon.code}
                </span>
              </span>
              <span>-{money(ledger.discount, currency)}</span>
            </div>
          ) : (
            <div className="flex justify-between text-slate-500">
              <span>Coupon</span>
              <span>None applied</span>
            </div>
          )}

          <div className="flex justify-between text-slate-400">
            <span>Shipping</span>
            <span className="text-slate-200 font-medium">{shipping}</span>
          </div>

          <div className="flex justify-between border-t border-slate-800 pt-2.5 text-base font-bold text-white">
            <span>Total</span>
            <span className="text-xl font-black text-cyan-300">{money(ledger.total, currency)}</span>
          </div>

          {ledger.total >= 30 && (
            <div className="mt-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 px-3 py-1.5 text-xs text-indigo-200 flex items-center justify-between">
              <span>
                or 4 interest-free payments of <strong>{money(ledger.total / 4, currency)}</strong>
              </span>
              <span className="font-bold text-indigo-400">Pay in 4</span>
            </div>
          )}
        </div>
      </div>

      <label className="mt-4 flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 cursor-pointer rounded-xl bg-slate-800/40 p-2.5 border border-slate-800">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
          checked={approved}
          onChange={(e) => onApprovedChange(e.target.checked)}
        />
        <span>
          I explicitly approve paying <strong className="text-white">{money(ledger.total, currency)}</strong> with PayPal.
        </span>
      </label>

      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={onPay}
          disabled={!approved || paying}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#ffc439] hover:bg-[#f4bb34] px-5 py-3 font-bold text-[#003087] shadow-lg shadow-amber-500/10 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.784.784 0 0 1 .773-.66h7.79c3.125 0 5.433 1.34 6.098 4.22.428 1.85-.027 3.65-1.328 4.96-1.35 1.357-3.374 1.93-5.748 1.93H9.79l-1.05 6.643a.64.64 0 0 1-.634.524h-.03z"
              fill="#003087"
            />
            <path
              d="M9.79 14.17h2.74c2.374 0 4.398-.573 5.748-1.93 1.3-1.31 1.756-3.11 1.328-4.96-.28-1.21-.97-2.19-2.02-2.88a6.38 6.38 0 0 1-.77 2.37c-.77 1.4-2.18 2.21-3.98 2.21H9.86l-.97 6.13.9-.94z"
              fill="#0079C1"
            />
          </svg>
          <span className="text-sm tracking-wide">
            {paying ? "Connecting to PayPal..." : "Pay with PayPal Sandbox"}
          </span>
        </button>

        {canCapture && (
          <button
            type="button"
            onClick={onCapture}
            disabled={paying}
            className="w-full rounded-xl border border-cyan-500 bg-cyan-500/10 px-4 py-2.5 font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors text-xs sm:text-sm"
          >
            I&apos;ve approved the payment in PayPal
          </button>
        )}
      </div>

      <p className="mt-3 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
        <svg className="h-3.5 w-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span>Protected by PayPal Buyer Protection · Idempotent</span>
      </p>

      {riskReasons.length > 0 && (
        <ul className="mt-3 list-inside list-disc text-xs text-red-400 bg-red-950/40 p-2.5 rounded-xl border border-red-800">
          {riskReasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}

      {payStatus && (
        <p className="mt-3 text-xs text-center text-slate-300 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
          {payStatus}
        </p>
      )}
    </section>
  );
}
