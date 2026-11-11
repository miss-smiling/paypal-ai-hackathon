"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Tag,
  Gift,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";
import { productService } from "@/lib/services";
import { Product } from "@/lib/types";
import { formatINR, calculateDiscount } from "@/lib/mockData";
import PayPalLogo from "@/components/ui/PayPalLogo";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const { addToast, appliedCoupon, isRegistered } = useSmartCart();

  const productIdParam = searchParams.get("productId");
  const couponParam = searchParams.get("coupon");

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMethod, setSelectedMethod] = useState<"paypal" | "card" | "upi">("paypal");
  const [couponCode, setCouponCode] = useState(couponParam || appliedCoupon || "SMART10");
  const [appliedCode, setAppliedCode] = useState<string | null>(
    couponParam || appliedCoupon || (isRegistered ? "SMART10" : null)
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Products in checkout
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    if (productIdParam) {
      const found = productService.getById(productIdParam);
      if (found) {
        setItems([found]);
        return;
      }
    }
    // Default to top 2 products
    setItems(productService.getAll().slice(0, 2));
  }, [productIdParam]);

  const subtotal = items.reduce((sum, p) => sum + p.price, 0);

  // 10% Discount calculation
  const discountResult = calculateDiscount(subtotal, appliedCode || undefined, selectedMethod);
  const discountAmount = discountResult.discount;
  const shipping = 0;
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (!isRegistered && couponCode.toUpperCase() === "SMART10") {
      addToast(
        "Registration Required",
        "Please register or log in to use the 10% discount coupon SMART10.",
        "warning"
      );
      return;
    }

    const res = calculateDiscount(subtotal, couponCode, selectedMethod);
    if (res.isEligible) {
      setAppliedCode(couponCode.trim().toUpperCase());
      addToast("Coupon Applied!", res.message, "success");
    } else {
      addToast("Coupon Not Applied", res.message || "Invalid coupon.", "error");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCode(null);
    setCouponCode("");
    addToast("Coupon Removed", "Standard price restored.", "info");
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const generatedId = `PP-SC-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      setIsProcessing(false);
      setStep(3);
      addToast(
        "PayPal Payment Approved!",
        `Order #${generatedId} confirmed with 10% SmartCart discount.`,
        "success"
      );
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

            <div className="flex items-center justify-center gap-2">
              <PayPalLogo className="h-5" />
              <span className="text-sm font-bold text-slate-700">Payment Captured</span>
            </div>

            <h2 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your transaction was processed with 10% SmartCart discount via PayPal.
              Tracking details and proof of purchase have been recorded.
            </p>
            <div className="inline-block rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-2 font-mono text-sm font-bold text-indigo-700">
              PayPal Reference #{orderId}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/history"
                className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
              >
                View Shopping History
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 saas-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>Fulfillment &amp; Savings Status</span>
            </h3>

            <div className="space-y-4 text-xs pt-2">
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[10px]">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-slate-900">10% Discount Applied</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">
                    Saved {formatINR(discountAmount)} with coupon SMART10
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[10px]">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-slate-900">PayPal Express Orders v2</p>
                  <p className="text-[11px] text-slate-400">Captured at {formatINR(total)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[10px]">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-slate-900">Budget Auto-Deduction</p>
                  <p className="text-[11px] text-slate-400">Recorded against your monthly tech budget</p>
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
                  {/* Option A: PayPal Express (With 10% Discount) */}
                  <div
                    onClick={() => setSelectedMethod("paypal")}
                    className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                      selectedMethod === "paypal"
                        ? "border-[#0070ba] bg-blue-50/40 ring-2 ring-blue-100"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-2xs">
                          <PayPalLogo variant="monogram" className="h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <PayPalLogo className="h-4" />
                            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              10% Discount Eligible
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1">
                            Pay with PayPal on SmartCart to enjoy 10% off your total order!
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-indigo-700 shrink-0">
                        {formatINR(total)}
                      </span>
                    </div>
                  </div>

                  {/* Fallback UPI / Card */}
                  <div
                    onClick={() => setSelectedMethod("upi")}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
                      selectedMethod === "upi"
                        ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">Direct UPI / QR Code</p>
                      <p className="text-[10px] text-slate-400">
                        *Note: 10% coupon SMART10 requires PayPal checkout.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {formatINR(subtotal)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    disabled={isProcessing}
                    onClick={handleConfirmPayment}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0070ba] hover:bg-[#005ea6] py-3 text-xs font-bold text-white shadow-sm transition-all hover:scale-[1.01] disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span>Connecting to PayPal Sandbox...</span>
                    ) : (
                      <>
                        <PayPalLogo variant="white" className="h-4" />
                        <span>
                          Pay with PayPal · {formatINR(total)}
                          {discountAmount > 0 && ` (Save ${formatINR(discountAmount)})`}
                        </span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Official PayPal Buyer Protection Guarantee</span>
                  </div>
                </div>
              </div>
            )}

            {/* DUAL OPTION NOTICE: Prefer to buy on Retailer directly? */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Prefer to Buy Directly on the Retailer Website?
                </span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">
                  Standard Full Price
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                If you prefer not to pay with PayPal on SmartCart, you can visit the respective retailer (Amazon / Flipkart) and pay their regular price of{" "}
                <strong>{formatINR(subtotal)}</strong> without our 10% savings.
              </p>
              {items[0]?.retailerUrl && (
                <div className="pt-1">
                  <a
                    href={items[0].retailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    <span>Visit {items[0].retailer} store directly</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Order Summary & Coupon Code Box */}
          <div className="lg:col-span-5 space-y-4">
            <div className="saas-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Order Summary
              </h3>

              <div className="space-y-3">
                {items.map((p) => (
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
                      <p className="text-[11px] text-slate-400">
                        Retailer: {p.retailer}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {formatINR(p.price)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Box */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Registration Coupon (10% Discount)
                </label>

                {appliedCode ? (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="font-mono font-bold text-emerald-800">
                        {appliedCode}
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        (10% Off Applied)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] font-bold text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code (e.g. SMART10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs uppercase font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {!isRegistered && (
                  <div className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600" />
                    <span>
                      To get the 10% discount,{" "}
                      <Link href="/signup" className="font-bold underline hover:text-amber-900">
                        register yourself
                      </Link>{" "}
                      to unlock coupon code SMART10.
                    </span>
                  </div>
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span className="flex items-center gap-1">
                      <Gift className="h-3.5 w-3.5" />
                      <span>SmartCart 10% Discount ({appliedCode})</span>
                    </span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500">
                  <span>Delivery Charge</span>
                  <span className="text-emerald-600 font-semibold">Free</span>
                </div>

                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-black text-slate-900">
                  <span>Total Due</span>
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

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-2 text-xs text-slate-500">Loading checkout...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
