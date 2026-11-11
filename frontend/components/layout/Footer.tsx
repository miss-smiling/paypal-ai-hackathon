"use client";

import Link from "next/link";
import PayPalLogo from "@/components/ui/PayPalLogo";
import { Sparkles, ShieldCheck, Heart, Award, Gift, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/80 backdrop-blur-md">
      {/* PayPal 10% Discount Callout Banner */}
      <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 via-violet-50 to-blue-50 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-sm">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                Register on SmartCart &amp; Pay with PayPal to Get <span className="text-indigo-600 font-black">10% OFF</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Compare Amazon &amp; Flipkart prices, then check out with PayPal on our platform for exclusive savings with coupon <span className="font-mono font-bold text-indigo-700 bg-indigo-100/70 px-1.5 py-0.5 rounded">SMART10</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <span>Claim 10% Coupon</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Hackathon Showcase */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="SmartCart Logo"
                className="h-9 w-9 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="text-xl font-black tracking-tight text-slate-900">
                SmartCart
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-md">
              AI-powered shopping intelligence and cross-platform product comparison.
              We help you find what is truly worth buying across Amazon and Flipkart,
              manage your budget, and save 10% when you complete your purchase using PayPal.
            </p>

            {/* Official PayPal Hackathon Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2">
              <span className="text-[11px] font-semibold text-slate-500">Powered by</span>
              <PayPalLogo className="h-4" />
              <span className="text-slate-300">|</span>
              <span className="text-[11px] font-bold text-slate-700">AI Hackathon Project</span>
            </div>
          </div>

          {/* Col 2: Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Shopping Tools
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/assistant" className="hover:text-indigo-600 transition-colors">
                  CART AI Assistant
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-indigo-600 transition-colors">
                  Side-by-Side Comparison
                </Link>
              </li>
              <li>
                <Link href="/budget" className="hover:text-indigo-600 transition-colors">
                  Budget Planner &amp; Earmarks
                </Link>
              </li>
              <li>
                <Link href="/watchlist" className="hover:text-indigo-600 transition-colors">
                  Watchlist &amp; Price Alerts
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-indigo-600 transition-colors">
                  Shopping Activity History
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: PayPal Benefits */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Payment &amp; Savings
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                <span>10% PayPal Off on SmartCart</span>
              </li>
              <li>
                <Link href="/signup" className="hover:text-indigo-600 transition-colors">
                  Register for Coupon SMART10
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-indigo-600 transition-colors">
                  Express PayPal Checkout
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Or Pay Full on Amazon/Flipkart</span>
              </li>
              <li>
                <Link href="/settings" className="hover:text-indigo-600 transition-colors">
                  Buyer Protection Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Attribution & Hackathon Notice */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-xs text-slate-500">
            {/* Required user string */}
            <span className="font-semibold text-slate-800">
              All Rights are Reserved ,made For PayPal AI Hackathon
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span>© 2026 SmartCart.</span>
          </div>

          {/* Official PayPal Logo at the bottom */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400">Secure Payments with</span>
            <div className="p-1 rounded bg-white border border-slate-200 shadow-2xs">
              <PayPalLogo className="h-4" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
