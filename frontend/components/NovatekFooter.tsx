"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Shield, Lock } from "lucide-react";

export default function NovatekFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-slate-800/80 bg-[#06080e] pt-16 pb-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Newsletter & Brand Row */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 pb-14 border-b border-slate-800/80">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-400 p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#090c15]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4 text-cyan-400"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M4 20V4l16 16V4" />
                  </svg>
                </div>
              </div>
              <span className="text-xl font-black tracking-widest text-white">
                NOVATEK
              </span>
            </Link>

            <p className="mt-4 max-w-md text-sm text-slate-400 leading-relaxed">
              Pioneering aerospace-grade personal electronics, intelligent acoustic engineering, and autonomous commerce. Designed for precision, speed, and endurance.
            </p>

            <div className="mt-6 flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-cyan-400" />
                <span>256-Bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-cyan-400" />
                <span>PayPal Verified</span>
              </div>
            </div>
          </div>

          {/* Newsletter Form */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="rounded-2xl border border-slate-800 bg-[#0d111d] p-6">
              <h3 className="text-base font-bold text-white">
                Subscribe to Novatek Dispatch
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Receive secret product drops, firmware releases, and early access VIP discounts.
              </p>

              {subscribed ? (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 p-3 text-xs text-cyan-300">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>You are subscribed! Check your inbox for your 15% discount code.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition-all hover:bg-blue-500 hover:scale-105"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Links Navigation Grid */}
        <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hardware</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li><Link href="/#featured-products" className="hover:text-cyan-400 transition-colors">NovaPhone 15 Pro</Link></li>
              <li><Link href="/#featured-products" className="hover:text-cyan-400 transition-colors">NovaBuds Pro</Link></li>
              <li><Link href="/#featured-products" className="hover:text-cyan-400 transition-colors">NovaBook Air M2</Link></li>
              <li><Link href="/#featured-products" className="hover:text-cyan-400 transition-colors">NovaWatch X</Link></li>
              <li><Link href="/#featured-products" className="hover:text-cyan-400 transition-colors">NovaSound Max</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Intelligence</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li><Link href="/assistant" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">NovaAI Shopping Assistant</Link></li>
              <li><Link href="/compare" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">Device Spec Comparator</Link></li>
              <li><Link href="/budget" className="hover:text-cyan-400 transition-colors">Smart Budget Planner</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Buyer Insights Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Support & Care</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li><a href="#care" className="hover:text-cyan-400 transition-colors">Novatek Care+ Protection</a></li>
              <li><Link href="/orders" className="hover:text-cyan-400 transition-colors">Track Your Order</Link></li>
              <li><a href="#returns" className="hover:text-cyan-400 transition-colors">30-Day Hassle-Free Returns</a></li>
              <li><a href="#warranty" className="hover:text-cyan-400 transition-colors">Warranty Registration</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li><a href="#about" className="hover:text-cyan-400 transition-colors">About Novatek Labs</a></li>
              <li><a href="#sustainability" className="hover:text-cyan-400 transition-colors">100% Recycled Aluminum</a></li>
              <li><a href="#careers" className="hover:text-cyan-400 transition-colors">Engineering Careers</a></li>
              <li><a href="#privacy" className="hover:text-cyan-400 transition-colors">Privacy & Security</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Icons */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 sm:flex-row text-xs text-slate-500">
          <div>
            © 2026 NOVATEK Inc. All rights reserved. Powered by Autonomous Agentic Commerce.
          </div>

          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-400">PayPal</span>
            <span>·</span>
            <span className="font-semibold text-slate-400">Apple Pay</span>
            <span>·</span>
            <span className="font-semibold text-slate-400">Google Pay</span>
            <span>·</span>
            <span className="font-semibold text-slate-400">Visa / Mastercard</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
