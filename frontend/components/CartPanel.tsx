import type { Ledger } from "@/lib/types";

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
  ledger: Ledger;
  approved: boolean;
  onApprovedChange: (value: boolean) => void;
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
  const shipping = ledger.shipping === 0 ? "Free" : money(ledger.shipping, ledger.currency);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">SmartCart</h2>

      <div className="mt-3 space-y-2 text-sm">
        <div className="space-y-2 border-b border-slate-100 pb-3">
          {ledger.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-10 w-10 shrink-0 rounded-lg object-cover border border-slate-200"
                  />
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                    Cart
                  </div>
                )}
                <span className="truncate font-medium text-slate-800">{item.name}</span>
              </div>
              <span className="shrink-0 font-semibold text-slate-900">{money(item.price, ledger.currency)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-slate-600 pt-1">
          <span>Subtotal</span>
          <span>{money(ledger.subtotal, ledger.currency)}</span>
        </div>
        {ledger.coupon ? (
          <div className="flex justify-between text-emerald-700">
            <span>
              Coupon {ledger.coupon.code} ({ledger.coupon.description})
            </span>
            <span>-{money(ledger.discount, ledger.currency)}</span>
          </div>
        ) : (
          <div className="flex justify-between text-slate-500">
            <span>No coupon applied</span>
            <span>$0.00</span>
          </div>
        )}
        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <span>{shipping}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
          <span>Total</span>
          <span>{money(ledger.total, ledger.currency)}</span>
        </div>

        {ledger.total >= 30 && (
          <div className="mt-2 rounded-lg bg-blue-50/80 border border-blue-100 px-3 py-1.5 text-xs text-blue-900 flex items-center justify-between">
            <span>or 4 interest-free payments of <strong>{money(ledger.total / 4, ledger.currency)}</strong></span>
            <span className="font-bold text-[#003087]">Pay in 4</span>
          </div>
        )}
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
          checked={approved}
          onChange={(e) => onApprovedChange(e.target.checked)}
        />
        <span>
          I approve paying {money(ledger.total, ledger.currency)} for this cart.
        </span>
      </label>

      <div className="mt-4 space-y-2">
        <button
          onClick={onPay}
          disabled={!approved || paying}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#ffc439] hover:bg-[#f4bb34] px-5 py-3 font-bold text-[#003087] shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.784.784 0 0 1 .773-.66h7.79c3.125 0 5.433 1.34 6.098 4.22.428 1.85-.027 3.65-1.328 4.96-1.35 1.357-3.374 1.93-5.748 1.93H9.79l-1.05 6.643a.64.64 0 0 1-.634.524h-.03z" fill="#003087"/>
            <path d="M9.79 14.17h2.74c2.374 0 4.398-.573 5.748-1.93 1.3-1.31 1.756-3.11 1.328-4.96-.28-1.21-.97-2.19-2.02-2.88a6.38 6.38 0 0 1-.77 2.37c-.77 1.4-2.18 2.21-3.98 2.21H9.86l-.97 6.13.9-.94z" fill="#0079C1"/>
          </svg>
          <span>{paying ? "Connecting to PayPal..." : "Pay with PayPal"}</span>
        </button>
        {canCapture && (
          <button
            onClick={onCapture}
            disabled={paying}
            className="w-full rounded-xl border-2 border-brand bg-white px-4 py-2.5 font-semibold text-brand hover:bg-brand/5 transition-colors"
          >
            I&apos;ve approved the payment in PayPal
          </button>
        )}
      </div>

      <p className="mt-3 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
        <svg className="h-3.5 w-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Protected by PayPal Buyer Protection · Idempotent Zero-Duplicate
      </p>

      {riskReasons.length > 0 && (
        <ul className="mt-3 list-inside list-disc text-sm text-red-600">
          {riskReasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
      {payStatus && <p className="mt-3 text-sm text-slate-600">{payStatus}</p>}
    </section>
  );
}
