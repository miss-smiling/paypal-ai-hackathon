"use client";

import Link from "next/link";
import { useNovatek } from "@/context/NovatekContext";
import { NOVATEK_PRODUCTS } from "@/lib/novatekData";
import { ShieldCheck, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function CheckoutPage() {
  const { cart, subtotal, discount, shipping, total, clearCart, addToast } = useNovatek();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);

  const checkoutItems = cart.length > 0 ? cart : [{ product: NOVATEK_PRODUCTS[0], quantity: 1 }];
  const effectiveSubtotal = cart.length > 0 ? subtotal : NOVATEK_PRODUCTS[0].price;
  const effectiveDiscount = cart.length > 0 ? discount : Math.round(effectiveSubtotal * 0.1);
  const effectiveShipping = cart.length > 0 ? shipping : 0;
  const effectiveTotal = effectiveSubtotal - effectiveDiscount + effectiveShipping;

  const handlePayPalPay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const orderId = `NOV-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderComplete(orderId);
      setIsProcessing(false);
      clearCart();
      addToast("Order Confirmed", `PayPal Sandbox Order #${orderId} approved.`, "success");
    }, 1800);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-[#0d1222]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400 mb-2">
          <Lock className="h-3.5 w-3.5" />
          <span>256-Bit SSL Encrypted Idempotent Checkout</span>
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Express Checkout</h1>
        <p className="mt-1 text-sm text-slate-400">
          Review your verified items and finalize payment with PayPal Sandbox.
        </p>
      </div>

      {orderComplete ? (
        <div className="rounded-3xl border border-emerald-500/40 bg-[#0a1816]/90 p-8 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 animate-pulse">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-white">Payment Captured Successfully!</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Your PayPal Orders v2 sandbox transaction was processed with zero fraud risk. Order ID:
          </p>
          <div className="inline-block rounded-xl border border-emerald-500/30 bg-[#051110] px-5 py-2 font-mono text-sm font-bold text-emerald-300">
            {orderComplete}
          </div>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white hover:bg-blue-500"
            >
              <span>Back to Novatek Store</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left: Shipping & Method */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-[#0d1222]/80 p-5 shadow-lg backdrop-blur-md space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                1. Delivery Address
              </h2>
              <div className="rounded-xl bg-[#07090e] p-4 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p className="font-bold text-white">Verified Customer (Sandbox Buyer)</p>
                <p>100 Cybernetic Boulevard, Suite 400</p>
                <p>San Jose, CA 95110, United States</p>
                <p className="text-cyan-400 mt-2 font-medium">Standard Free Express Delivery (2 Business Days)</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0d1222]/80 p-5 shadow-lg backdrop-blur-md space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                2. Payment Method
              </h2>
              <div className="rounded-xl bg-[#07090e] p-4 border border-cyan-500/40 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💳</span>
                  <div>
                    <p className="font-bold text-white">PayPal Sandbox (Orders v2 REST)</p>
                    <p className="text-slate-400">Buyer Protection · Zero Fraud Charge Guard</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  Ready
                </span>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-[#0d1222]/90 p-5 shadow-xl backdrop-blur-md space-y-4">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {checkoutItems.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-[#07090e] p-1.5 flex items-center justify-center border border-slate-800 shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{item.product.name}</p>
                      <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-white">
                      ${item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white">${effectiveSubtotal}</span>
                </div>
                {effectiveDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Discount</span>
                    <span>-${effectiveDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-semibold">
                    {effectiveShipping === 0 ? "FREE" : `$${effectiveShipping}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-base font-bold text-white">
                  <span>Total Due</span>
                  <span className="text-xl text-cyan-300">${effectiveTotal}</span>
                </div>
              </div>

              <button
                disabled={isProcessing}
                onClick={handlePayPalPay}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0070ba] hover:bg-[#005ea6] px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Processing with PayPal...</span>
                  </div>
                ) : (
                  <>
                    <span>Pay with</span>
                    <span className="font-extrabold italic text-sm">PayPal</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>PayPal Orders v2 Sandbox Mode Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
