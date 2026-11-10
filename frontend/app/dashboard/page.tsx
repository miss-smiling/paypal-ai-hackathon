"use client";

import Link from "next/link";
import { User, ShieldCheck, ShoppingBag, SlidersHorizontal, Sparkles, Clock, ArrowRight } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";
import { NOVATEK_PRODUCTS } from "@/lib/novatekData";

export default function DashboardPage() {
  const { cartCount, compareList } = useNovatek();

  const recentOrders = [
    {
      id: "NOV-894120",
      date: "Nov 08, 2026",
      product: NOVATEK_PRODUCTS[4], // NovaSound Max
      status: "Delivered",
      total: "$349.00",
      payment: "PayPal Sandbox",
    },
    {
      id: "NOV-621890",
      date: "Oct 24, 2026",
      product: NOVATEK_PRODUCTS[1], // NovaBuds Pro
      status: "Delivered",
      total: "$199.00",
      payment: "PayPal Sandbox",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090f] py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Profile Card */}
        <div className="rounded-3xl border border-slate-800 bg-[#0d1222] p-8 shadow-2xl flex flex-col sm:flex-row items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-lg shadow-cyan-500/20">
            <User className="h-10 w-10" />
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-black text-white">Sujit Krishna</h1>
              <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                PRO MEMBER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">sujit.krishna@novatek-community.org</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-400 justify-center sm:justify-start">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Novatek Care+ Active
              </span>
              <span>·</span>
              <span>PayPal Verified</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-[#0a0e1c] p-5">
            <span className="text-xs text-slate-400">Shopping Bag</span>
            <div className="mt-2 text-2xl font-black text-white">{cartCount} Devices</div>
            <Link href="/" className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline">
              <span>View store catalog</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0a0e1c] p-5">
            <span className="text-xs text-slate-400">Active Comparisons</span>
            <div className="mt-2 text-2xl font-black text-cyan-300">{compareList.length} Items</div>
            <Link href="/compare" className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline">
              <span>Open Compare Studio</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0a0e1c] p-5">
            <span className="text-xs text-slate-400">AI Concierge Queries</span>
            <div className="mt-2 text-2xl font-black text-white">14 Analyzed</div>
            <Link href="/assistant" className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline">
              <span>Ask NovaAI Assistant</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Order History */}
        <div className="rounded-3xl border border-slate-800 bg-[#0a0e1c] p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span>Order History & Warranties</span>
          </h2>

          <div className="space-y-3">
            {recentOrders.map((ord) => (
              <div
                key={ord.id}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-[#06080e] p-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-[#0d1222] p-1 flex items-center justify-center border border-slate-800 shrink-0">
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
