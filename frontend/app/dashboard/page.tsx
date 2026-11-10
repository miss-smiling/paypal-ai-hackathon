"use client";

import Link from "next/link";
import { ShieldCheck, ShoppingBag, SlidersHorizontal, Sparkles, Clock, ArrowRight } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";
import { SMARTCART_PRODUCTS } from "@/lib/smartcartData";

export default function DashboardPage() {
  const { cartCount, compareList } = useNovatek();

  const recentOrders = [
    {
      id: "TN784512",
      date: "Nov 08, 2026",
      product: SMARTCART_PRODUCTS[0], // iPhone 16 Pro
      status: "Delivered",
      total: "$1,199.00",
      payment: "PayPal Sandbox",
    },
    {
      id: "TN621890",
      date: "Oct 24, 2026",
      product: SMARTCART_PRODUCTS[1], // Samsung Galaxy S24
      status: "Delivered",
      total: "$999.00",
      payment: "PayPal Sandbox",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090f] py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Profile Card with Minimalist Silhouette Avatar */}
        <div className="rounded-3xl border border-slate-800 bg-[#0d1226] p-8 shadow-2xl flex flex-col sm:flex-row items-center gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-cyan-400 bg-black shadow-lg shadow-cyan-500/20">
            <img
              src="/avatar.png"
              alt="User Silhouette Avatar"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-black text-white">Sujit Krishna</h1>
              <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                PRO BUYER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">sujit.krishna@smartcart-community.org</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-400 justify-center sm:justify-start">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                SmartCart Care+ Active
              </span>
              <span>·</span>
              <span>PayPal Verified Sandbox</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-[#0a0e1e] p-5">
            <span className="text-xs text-slate-400">SmartCart Bag</span>
            <div className="mt-2 text-2xl font-black text-white">{cartCount} Devices</div>
            <Link href="/" className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline">
              <span>View smartphone store</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0a0e1e] p-5">
            <span className="text-xs text-slate-400">Active Comparisons</span>
            <div className="mt-2 text-2xl font-black text-cyan-300">{compareList.length} Items</div>
            <Link href="/compare" className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline">
              <span>Open Compare Studio</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0a0e1e] p-5">
            <span className="text-xs text-slate-400">AI Concierge Queries</span>
            <div className="mt-2 text-2xl font-black text-white">18 Analyzed</div>
            <Link href="/assistant" className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline">
              <span>Ask SmartCart AI</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Order History */}
        <div className="rounded-3xl border border-slate-800 bg-[#0a0e1e] p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span>Order History & Warranties</span>
          </h2>

          <div className="space-y-3">
            {recentOrders.map((ord) => (
              <div
                key={ord.id}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-[#060810] p-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-[#0d1226] p-1 flex items-center justify-center border border-slate-800 shrink-0">
                    <img src={ord.product.image} alt={ord.product.name} className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{ord.product.name}</h3>
                    <p className="text-slate-500">Order #{ord.id} · {ord.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                    {ord.status}
                  </span>
                  <span className="font-bold text-white">{ord.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
