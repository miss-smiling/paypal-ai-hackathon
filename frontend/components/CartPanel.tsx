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
      <h2 className="text-lg font-bold text-white">SmartCart</h2>

      <div className="mt-4 space-y-2 text-sm">
        {ledger.items.map((item) => (
          <div key={item.id} className="flex justify-between font-medium text-slate-100">
            <span>{item.name}</span>
            <span>{money(item.price, ledger.currency)}</span>
          </div>
        ))}
        
        <div className="flex justify-between text-slate-400">
          <span>Subtotal</span>
          <span className="text-slate-200">{money(ledger.subtotal, ledger.currency)}</span>
        </div>

        {ledger.coupon ? (
          <div className="flex justify-between text-emerald-400">
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

        <div className="flex justify-between text-slate-400">
          <span>Shipping</span>
          <span className={ledger.shipping === 0 ? "text-emerald-400 font-medium" : "text-slate-200"}>
            {shipping}
          </span>
        </div>

        <div className="flex justify-between border-t border-slate-800 pt-3 text-base font-bold text-white">
          <span>Total</span>
          <span className="text-cyan-400 text-lg">{money(ledger.total, ledger.currency)}</span>
        </div>
      </div>

      <label className="mt-5 flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/20"
          checked={approved}
          onChange={(e) => onApprovedChange(e.target.checked)}
        />
        <span>
          I approve paying <strong className="text-white">{money(ledger.total, ledger.currency)}</strong> for this cart.
        </span>
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onPay}
          disabled={!approved || paying}
          className="rounded-xl bg-[#60a5fa] px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/20 transition-all hover:bg-[#3b82f6] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {paying ? "Processing..." : "Pay with PayPal"}
        </button>
        {canCapture && (
          <button
            onClick={onCapture}
            disabled={paying}
            className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
          >
            I&apos;ve approved the payment
          </button>
        )}
      </div>

      {riskReasons.length > 0 && (
        <ul className="mt-3 list-inside list-disc text-xs text-red-400">
          {riskReasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
      
      {payStatus && (
        <p className="mt-4 text-xs font-medium leading-relaxed text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          {payStatus}
        </p>
      )}
    </section>
  );
}
