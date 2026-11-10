"use client";

import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";

export default function NovatekFooter() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060810] pt-16 pb-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Links */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 pb-12 border-b border-slate-800/80">
          
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#090e1c]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4 text-cyan-400"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                  </svg>
                </div>
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                SmartCart
              </span>
            </Link>

            <p className="mt-3 text-xs text-slate-400">
              Better Tech. Brighter Tomorrow.
            </p>

            <p className="mt-4 max-w-sm text-xs text-slate-500 leading-relaxed">
              Autonomous multi-agent commerce transforming conversational search into verified discoveries, real-time value comparisons, and optimized carts.
            </p>

            {/* Social Icons matching sample */}
            <div className="mt-6 flex items-center gap-3 text-slate-400">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 hover:text-white cursor-pointer text-xs font-bold">f</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 hover:text-white cursor-pointer text-xs font-bold">IG</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 hover:text-white cursor-pointer text-xs font-bold">YT</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 hover:text-white cursor-pointer text-xs font-bold">TT</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li><Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
              <li><Link href="/#popular-smartphones" className="hover:text-cyan-400 transition-colors">Shop</Link></li>
              <li><Link href="/assistant" className="text-cyan-400 font-semibold hover:text-cyan-300">AI Assistant</Link></li>
              <li><Link href="/compare" className="text-cyan-400 font-semibold hover:text-cyan-300">Compare Studio</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">About</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Categories</h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li><Link href="/#popular-smartphones" className="hover:text-cyan-400 transition-colors">iPhone</Link></li>
              <li><Link href="/#popular-smartphones" className="hover:text-cyan-400 transition-colors">Samsung</Link></li>
              <li><Link href="/#popular-smartphones" className="hover:text-cyan-400 transition-colors">Google Pixel</Link></li>
              <li><Link href="/#popular-smartphones" className="hover:text-cyan-400 transition-colors">OnePlus</Link></li>
              <li><Link href="/#categories" className="hover:text-cyan-400 transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Customer Service & Payment Methods */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Service</h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li><a href="#help" className="hover:text-cyan-400 transition-colors">Help Center</a></li>
              <li><a href="#shipping" className="hover:text-cyan-400 transition-colors">Shipping</a></li>
              <li><a href="#returns" className="hover:text-cyan-400 transition-colors">Returns</a></li>
              <li><Link href="/orders" className="hover:text-cyan-400 transition-colors">Track Order</Link></li>
            </ul>

            <div className="mt-6">
              <h5 className="text-[11px] font-bold text-slate-300 uppercase">Payment Methods</h5>
              <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-300">
                <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-blue-400">VISA</span>
                <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[#0070ba]">PayPal</span>
                <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-white">Apple Pay</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 SmartCart. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-300 transition-colors">Terms & Conditions</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
