import type { Ledger } from "@/lib/types";

function money(n: number, currency = "INR"): string {
  if (currency === "INR" || currency === "₹") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
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
    <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          SmartCart Summary
        </h2>
        <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
          {ledger.items.length} {ledger.items.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        {ledger.items.map((item) => (
          <div key={item.id} className="flex justify-between font-medium text-slate-200">
            <span>{item.name}</span>
            <span>{money(item.price, ledger.currency)}</span>
          </div>
        ))}

        <div className="border-t border-slate-800/60 pt-3 space-y-2">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="text-slate-300">{money(ledger.subtotal, ledger.currency)}</span>
          </div>

          {ledger.coupon ? (
            <div className="flex justify-between text-emerald-400">
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Coupon ({ledger.coupon.code})
              </span>
              <span>-{money(ledger.discount, ledger.currency)}</span>
            </div>
          ) : (
            <div className="flex justify-between text-slate-500">
              <span>Coupon</span>
              <span>$0.00</span>
            </div>
          )}

          <div className="flex justify-between text-slate-400">
            <span>Shipping</span>
            <span className={ledger.shipping === 0 ? "text-emerald-400 font-medium" : "text-slate-300"}>
              {shipping}
            </span>
          </div>
        </div>

        <div className="flex justify-between border-t border-slate-800/80 pt-3 text-base font-bold text-white">
          <span>Total</span>
          <span className="text-xl text-cyan-400">{money(ledger.total, ledger.currency)}</span>
        </div>
      </div>

      {/* Approval Checkbox */}
      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs text-slate-300 transition-colors hover:border-slate-700">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/20"
          checked={approved}
          onChange={(e) => onApprovedChange(e.target.checked)}
        />
        <span className="leading-relaxed">
          I approve autonomous execution of <strong className="text-white">{money(ledger.total, ledger.currency)}</strong> payment for this cart.
        </span>
      </label>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={onPay}
          disabled={!approved || paying}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .762-.647h6.777c2.518 0 4.54.58 5.485 1.705.888 1.058 1.077 2.628.533 4.417-.79 2.597-2.73 4.29-5.462 4.767l.118-.016h-3.41l-.988 6.27-.087.55a.64.64 0 0 1-.632.573z" />
          </svg>
          {paying ? "Processing Order..." : "Pay with PayPal"}
        </button>

        {canCapture && (
          <button
            onClick={onCapture}
            disabled={paying}
            className="w-full rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-300 transition-all hover:bg-cyan-500/20"
          >
            I&apos;ve Approved the Payment Window
          </button>
        )}
      </div>

      {riskReasons.length > 0 && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          <p className="font-semibold">Risk Flags Triggered:</p>
          <ul className="mt-1 list-inside list-disc space-y-1">
            {riskReasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {payStatus && (
        <p className="mt-3 text-center text-xs font-medium text-slate-400">
          {payStatus}
        </p>
      )}
    </section>
  );
}
