"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Lock, Mail, Gift } from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useSmartCart();
  const [email, setEmail] = useState("sujit.krishna@smartcart.ai");
  const [password, setPassword] = useState("••••••••••••");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addToast("Signed In Successfully", "Welcome back to SmartCart.", "success");
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 my-6 animate-fade-in">
      <div className="saas-card p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200">
        {/* Brand */}
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
            Sign In to SmartCart
          </h1>
          <p className="text-xs text-slate-500">
            Enter your credentials to access your shopping intelligence dashboard
          </p>
        </div>

        {/* 10% Registration Callout */}
        <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-900 flex items-center gap-2.5">
          <Gift className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>
            New here?{" "}
            <Link href="/signup" className="font-bold underline hover:text-indigo-950">
              Register now
            </Link>{" "}
            to unlock your 10% discount code (SMART10) with PayPal!
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Password</label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  addToast("Password Reset", "Demo reset link sent.", "info");
                }}
                className="text-[11px] text-indigo-600 hover:underline"
              >
                Forgot password?
              </a>
            </div>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 px-4 shadow-sm transition-all hover:scale-[1.01]"
          >
            {isLoading ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to SmartCart</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-indigo-600 hover:underline">
            Register &amp; Claim 10% Discount
          </Link>
        </div>
      </div>
    </div>
  );
}
