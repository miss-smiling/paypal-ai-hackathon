"use client";

import Link from "next/link";
import { TOP_DEALS } from "../page";

function money(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function CheckoutPage() {
  const primaryItem = TOP_DEALS[0];
  const subtotal = primaryItem.price;
  const discount = Math.round(subtotal * 0.1);
  const total = subtotal - discount;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400 mb-2">
          <span>🔒 256-Bit SSL Encrypted</span>
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Express Checkout</h1>
        <p className="mt-1 text-sm text-slate-400">
          Review your verified items and finalize payment with PayPal Sandbox.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left: Shipping & Method */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">1. Delivery Address</h2>
            <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p className="font-bold text-white">Sujit Krishna (Sandbox Buyer)</p>
              <p>12/4 MG Road, Indiranagar</p>
              <p>Bangalore, Karnataka, 560038, India</p>
              <p className="text-cyan-400 mt-2 font-medium">Standard Free Delivery (2 Business Days)</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">2. Payment Method</h2>
            <div className="rounded-xl bg-slate-950 p-4 border border-cyan-500/40 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💳</span>
                <div>
                  <p className="font-bold text-white">PayPal Sandbox (Orders v2 REST)</p>
                  <p className="text-slate-400">Buyer Protection &middot; Zero Fraud Charge Guard</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Order Summary
            </h2>

            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-slate-950 p-2 flex items-center justify-center border border-slate-800">
                <img src={primaryItem.image_url} alt={primaryItem.name} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{primaryItem.name}</p>
                <p className="text-[11px] text-slate-400">Qty: 1 &middot; {primaryItem.store}</p>
                <p className="text-xs font-black text-cyan-300 mt-0.5">{money(primaryItem.price)}</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-200">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Coupon SAVE10 (10% OFF)</span>
                <span>-{money(discount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="text-emerald-400 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-base font-bold text-white">
                <span>Total Due</span>
                <span className="text-xl text-cyan-300">{money(total)}</span>
              </div>
            </div>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#ffc439] hover:bg-[#f4bb34] px-5 py-3 font-bold text-[#003087] shadow-lg transition-all"
            >
              <span>Pay with PayPal Sandbox &rarr;</span>
            </Link>

            <p className="text-center text-[10px] text-slate-500">
              No live credit card required in sandbox mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
