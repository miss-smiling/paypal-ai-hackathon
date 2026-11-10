"use client";

import Link from "next/link";
import { useNovatek } from "@/context/NovatekContext";
import { SMARTCART_PRODUCTS } from "@/lib/smartcartData";
import { ShieldCheck, ArrowRight, Lock, CheckCircle2, Check, Clock } from "lucide-react";
import { useState } from "react";

export default function CheckoutPage() {
  const { cart, subtotal, discount, shipping, total, clearCart, addToast } = useNovatek();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMethod, setSelectedMethod] = useState<"paypal" | "card" | "applepay" | "cod">("paypal");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const checkoutItems =
    cart.length > 0
      ? cart
      : [
          { product: SMARTCART_PRODUCTS[0], quantity: 1 },
          { product: SMARTCART_PRODUCTS[1], quantity: 1 },
          { product: SMARTCART_PRODUCTS[SMARTCART_PRODUCTS.length - 1], quantity: 1 },
        ];

  const effectiveSubtotal = cart.length > 0 ? subtotal : 2447;
  const effectiveDiscount = cart.length > 0 ? discount : 0;
  const effectiveShipping = cart.length > 0 ? shipping : 0;
  const effectiveTotal = effectiveSubtotal - effectiveDiscount + effectiveShipping;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const generatedId = `TN${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      setIsProcessing(false);
      setStep(3);
      clearCart();
      addToast("Order Placed Successfully!", `SmartCart Order #${generatedId} confirmed.`, "success");
    }, 1600);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header & Steps Indicator matching sample mobile screen */}
      <div className="rounded-3xl border border-slate-800 bg-[#0d1226]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
              <Lock className="h-3.5 w-3.5" />
              <span>SmartCart Express Checkout</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {step === 1 ? "Shipping Details" : step === 2 ? "Payment Method" : "Order Confirmation"}
            </h1>
          </div>

          {/* Stepper (1 Shipping · 2 Payment · 3 Confirmation) */}
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-bold ${
                step >= 1 ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              <span>1</span> Shipping
            </span>
            <span className="text-slate-600">→</span>
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-bold ${
                step >= 2 ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              <span>2</span> Payment
            </span>
            <span className="text-slate-600">→</span>
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-bold ${
                step === 3 ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              <span>3</span> Confirmation
            </span>
          </div>
        </div>
      </div>

      {step === 3 ? (
        /* Step 3: Order Placed Successfully + Tracking Stepper matching sample */
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-3xl border border-emerald-500/40 bg-[#09151f]/90 p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/40 text-cyan-300 animate-pulse">
              <CheckCircle2 className="h-10 w-10 text-cyan-400" />
            </div>

            <h2 className="text-2xl font-black text-white">Order Placed Successfully!</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Thank you for your order. Your tracking identifier is:
            </p>
            <div className="inline-block rounded-xl border border-cyan-500/30 bg-[#060810] px-5 py-2 font-mono text-sm font-bold text-cyan-300">
              #{orderId}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/orders"
                className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white hover:bg-blue-500"
              >
                View Order Details
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Track Your Order Stepper (matching right-most phone screen in sample) */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-[#0d1226]/90 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>Track Your Order (#{orderId})</span>
            </h3>

            <div className="space-y-4 text-xs pt-2">
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-slate-950 font-bold text-[10px]">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-white">Order Placed</p>
                  <p className="text-[10px] text-slate-400">Verified and approved</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-slate-950 font-bold text-[10px]">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-white">Processing</p>
                  <p className="text-[10px] text-slate-400">Allocated in SmartCart fulfillment center</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-950/40 text-cyan-300 text-[10px]">
                  •
                </div>
                <div>
                  <p className="font-bold text-slate-300">Shipped</p>
                  <p className="text-[10px] text-slate-500">Carrier dispatched with GPS tracking</p>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-50">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-700 text-[10px]">
                  •
                </div>
                <div>
                  <p className="font-bold text-slate-400">Out for Delivery</p>
                  <p className="text-[10px] text-slate-500">Expected in 2 business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Left Form: Step 1 Shipping or Step 2 Payment */}
          <div className="lg:col-span-7 space-y-6">
            {step === 1 ? (
              /* Step 1: Shipping Address */
              <form onSubmit={handleProceedToPayment} className="rounded-2xl border border-slate-800 bg-[#0d1226]/80 p-6 shadow-lg backdrop-blur-md space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Shipping Address
                </h2>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      defaultValue="Sarah Ahmed"
                      className="w-full rounded-xl border border-slate-700 bg-[#07090e] p-3 text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Address</label>
                    <input
                      type="text"
                      required
                      defaultValue="12 Rue des Fleurs"
                      className="w-full rounded-xl border border-slate-700 bg-[#07090e] p-3 text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">City</label>
                      <input
                        type="text"
                        required
                        defaultValue="San Francisco"
                        className="w-full rounded-xl border border-slate-700 bg-[#07090e] p-3 text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Postal Code</label>
                      <input
                        type="text"
                        required
                        defaultValue="94105"
                        className="w-full rounded-xl border border-slate-700 bg-[#07090e] p-3 text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      defaultValue="+1 (555) 234-5678"
                      className="w-full rounded-xl border border-slate-700 bg-[#07090e] p-3 text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all hover:scale-[1.01]"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Payment Method matching mobile screen */
              <div className="rounded-2xl border border-slate-800 bg-[#0d1226]/80 p-6 shadow-lg backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Payment Method
                  </h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    Edit Shipping
                  </button>
                </div>

                <div className="space-y-3">
                  {/* PayPal */}
                  <div
                    onClick={() => setSelectedMethod("paypal")}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                      selectedMethod === "paypal"
                        ? "border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400"
                        : "border-slate-800 bg-[#080b16]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💳</span>
                      <div>
                        <p className="text-xs font-bold text-white">PayPal Sandbox</p>
                        <p className="text-[10px] text-slate-400">Orders v2 REST · Buyer Protection</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#0070ba]">PayPal</span>
                  </div>

                  {/* Credit / Debit Card */}
                  <div
                    onClick={() => setSelectedMethod("card")}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                      selectedMethod === "card"
                        ? "border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400"
                        : "border-slate-800 bg-[#080b16]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💳</span>
                      <div>
                        <p className="text-xs font-bold text-white">Credit / Debit Card</p>
                        <p className="text-[10px] text-slate-400">VISA · MasterCard · Amex</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">Card</span>
                  </div>

                  {/* Apple Pay */}
                  <div
                    onClick={() => setSelectedMethod("applepay")}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                      selectedMethod === "applepay"
                        ? "border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400"
                        : "border-slate-800 bg-[#080b16]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl"></span>
                      <div>
                        <p className="text-xs font-bold text-white">Apple Pay</p>
                        <p className="text-[10px] text-slate-400">Touch ID & Face ID</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-white">Pay</span>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    disabled={isProcessing}
                    onClick={handleConfirmPayment}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span>Connecting Sandbox...</span>
                    ) : (
                      <>
                        <span>Confirm Payment (${effectiveTotal}.00)</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary matching mobile screenshot */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-[#0d1226]/90 p-5 shadow-xl backdrop-blur-md space-y-4">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {checkoutItems.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-[#060810] p-1.5 flex items-center justify-center border border-slate-800 shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400">{item.product.storageOption || "256GB"} · Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-white">
                      ${item.product.price * item.quantity}.00
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white">${effectiveSubtotal}.00</span>
                </div>
                {effectiveDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Discount</span>
                    <span>-${effectiveDiscount}.00</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-semibold">
                    {effectiveShipping === 0 ? "Free" : `$${effectiveShipping}.00`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-base font-bold text-white">
                  <span>Total</span>
                  <span className="text-cyan-300">${effectiveTotal}.00</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
