"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Lock, Mail, User, Gift, CheckCircle2, Copy } from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";
import PayPalLogo from "@/components/ui/PayPalLogo";

export default function SignupPage() {
  const router = useRouter();
  const { addToast, setIsRegistered, setAppliedCoupon } = useSmartCart();
  const [name, setName] = useState("Sujit Krishna");
  const [email, setEmail] = useState("sujit.krishna@smartcart.ai");
  const [password, setPassword] = useState("••••••••••••");
  const [confirmPassword, setConfirmPassword] = useState("••••••••••••");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [couponUnlocked, setCouponUnlocked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsRegistered(true);
      setAppliedCoupon("SMART10");
      setCouponUnlocked(true);
      addToast(
        "Welcome to SmartCart!",
        "10% Discount Coupon (SMART10) unlocked for PayPal payments.",
        "success"
      );
    }, 600);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText("SMART10");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast("Coupon Copied!", "Use code SMART10 at PayPal checkout for 10% off.", "info");
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 my-6 animate-fade-in">
      <div className="saas-card p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200">
        {/* Brand & Logo */}
        <div className="text-center space-y-2">
          <Link href="/dashboard" className="inline-flex items-center gap-2 mb-1 group">
            <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="SmartCart"
                className="h-full w-full object-contain"
              />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-slate-900">
            Create Your SmartCart Account
          </h1>
          <p className="text-xs text-slate-500">
            Compare products, track price drops &amp; unlock exclusive savings
          </p>
        </div>

        {/* 10% Discount Incentive Banner */}
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-violet-50/60 to-blue-50/90 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                Register &amp; Get <span className="text-indigo-600 font-black">10% OFF Total Cost</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Valid on all purchases paid with PayPal on SmartCart.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/90 border border-indigo-100 p-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Coupon:</span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                SMART10
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">with</span>
              <PayPalLogo className="h-3" />
            </div>
          </div>
        </div>

        {couponUnlocked ? (
          <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 p-5 text-center space-y-4 animate-scale-up">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                🎉 10% Discount Code Unlocked!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Your coupon code <strong className="font-mono text-indigo-700 font-bold">SMART10</strong> is now active for PayPal checkout.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>{copied ? "Copied!" : "Copy SMART10"}</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/onboarding")}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-white font-bold transition-all disabled:opacity-50 shadow-xs"
              >
                {isLoading ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <span>Register &amp; Claim 10% Coupon</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
          <p>
            Already registered?{" "}
            <Link href="/login" className="font-bold text-indigo-600 hover:underline">
              Sign In
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Official PayPal AI Hackathon 2026 Showcase</span>
          </div>
        </div>
      </div>
    </div>
  );
}
