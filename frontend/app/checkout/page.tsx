"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";
import { productService } from "@/lib/services";
import { formatINR } from "@/lib/mockData";

export default function CheckoutPage() {
  const { addToast } = useSmartCart();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMethod, setSelectedMethod] = useState<"paypal" | "card" | "upi">("paypal");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const sampleProducts = productService.getAll().slice(0, 2);
  const subtotal = sampleProducts.reduce((sum, p) => sum + p.price, 0);
  const discount = 3000;
  const shipping = 0;
  const total = subtotal - discount + shipping;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const generatedId = `SC-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      setIsProcessing(false);
      setStep(3);
      addToast("Order Placed Successfully!", `SmartCart Order #${generatedId} confirmed.`, "success");
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">
      {/* Header & Steps Indicator */}
      <div className="saas-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-widest mb-1">
              <Lock className="h-3.5 w-3.5 text-indigo-600" />
              <span>SmartCart Express Checkout</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {step === 1 ? "Shipping Details" : step === 2 ? "Payment Method" : "Order Confirmation"}
            </h1>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-bold ${
                step >= 1 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              <span>1</span> Shipping
            </span>
            <span className="text-slate-300">→</span>
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-bold ${
                step >= 2 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              <span>2</span> Payment
            </span>
            <span className="text-slate-300">→</span>
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-bold ${
                step === 3 ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              <span>3</span> Confirmed
            </span>
          </div>
        </div>
      </div>

      {step === 3 ? (
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 saas-card p-8 text-center space-y-4 border-emerald-200 bg-emerald-50/20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <h2 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your transaction has been approved and logged against your shopping budget.
            </p>
            <div className="inline-block rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-2 font-mono text-sm font-bold text-indigo-700">
              Tracking #{orderId}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/orders"
                className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white hover:bg-indigo-700"
              >
                View Order Details
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 saas-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>Fulfillment Status</span>
            </h3>

            <div className="space-y-4 text-xs pt-2">
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[10px]">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-slate-900">Order Confirmed</p>
                  <p className="text-[11px] text-slate-400">Payment processed via PayPal Sandbox</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[10px]">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-slate-900">Budget Earmarked</p>
                  <p className="text-[11px] text-slate-400">Deducted from Q4 Tech Budget</p>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-60">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-400 text-[10px]">
                  •
                </div>
                <div>
                  <p className="font-bold text-slate-600">Dispatched</p>
                  <p className="text-[11px] text-slate-400">Expected delivery in 2 business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Form: Shipping or Payment */}
          <div className="lg:col-span-7 space-y-6">
            {step === 1 ? (
              <form onSubmit={handleProceedToPayment} className="saas-card p-6 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Shipping Address
                </h2>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Full Name</label>
                    <input
                      type="text"
                      required
                      defaultValue="Sujit Krishna"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Address Line</label>
                    <input
                      type="text"
                      required
                      defaultValue="42 Indiranagar 100ft Road"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">City</label>
                      <input
                        type="text"
                        required
                        defaultValue="Bengaluru, Karnataka"
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">PIN Code</label>
                      <input
                        type="text"
                        required
                        defaultValue="560038"
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="saas-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                    Payment Gateway
                  </h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Edit Shipping
                  </button>
                </div>

                <div className="space-y-3">
                  <div
                    onClick={() => setSelectedMethod("paypal")}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                      selectedMethod === "paypal"
                        ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-indigo-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">PayPal Express Sandbox</p>
                        <p className="text-[10px] text-slate-500">Orders v2 REST · Buyer Protection</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#0070ba]">PayPal</span>
                  </div>

                  <div
                    onClick={() => setSelectedMethod("upi")}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                      selectedMethod === "upi"
                        ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Instant UPI / QR Code</p>
                        <p className="text-[10px] text-slate-500">Google Pay, PhonePe, Paytm</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">UPI</span>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    disabled={isProcessing}
                    onClick={handleConfirmPayment}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span>Connecting Gateway...</span>
                    ) : (
                      <>
                        <span>Authorize Payment ({formatINR(total)})</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                    <span>256-bit encrypted checkout sandbox</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Order Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div className="saas-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Order Summary
              </h3>

              <div className="space-y-3">
                {sampleProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-12 w-12 rounded-lg object-cover bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">{p.retailer}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {formatINR(p.price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Festive Discount</span>
                  <span>-{formatINR(discount)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery</span>
                  <span className="text-emerald-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-black text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-indigo-600">{formatINR(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
