
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

      <div className="mt-3 space-y-1 text-sm">
        {ledger.items.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>{item.name}</span>
            <span>{money(item.price, ledger.currency)}</span>
          </div>
        ))}
        <div className="flex justify-between text-slate-600">
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
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          className="mt-1"
          checked={approved}
          onChange={(e) => onApprovedChange(e.target.checked)}
        />
        <span>
          I approve paying {money(ledger.total, ledger.currency)} for this cart.
        </span>
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={onPay}
          disabled={!approved || paying}
          className="rounded-lg bg-brand px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {paying ? "Processing..." : "Pay with PayPal"}
        </button>
        {canCapture && (
          <button
            onClick={onCapture}
            disabled={paying}
            className="rounded-lg border border-brand px-4 py-2 font-medium text-brand"
          >
            I&apos;ve approved the payment
          </button>
        )}
      </div>

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
