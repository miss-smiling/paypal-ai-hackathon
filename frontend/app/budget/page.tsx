"use client";

import { useState } from "react";
import Link from "next/link";
import { DollarSign, ShieldCheck, ShoppingBag, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";
import { SMARTCART_PRODUCTS } from "@/lib/smartcartData";

export default function BudgetPlannerPage() {
  const { subtotal, addToCart } = useNovatek();
  const [targetBudget, setTargetBudget] = useState(1500);

  const remaining = Math.max(0, targetBudget - subtotal);
  const spentPct = Math.min(100, Math.round((subtotal / targetBudget) * 100));

  const recommendedPackages = [
    {
      title: "The Pro Ecosystem Bundle",
      budget: "$1,448.00",
      items: [
        SMARTCART_PRODUCTS[0], // iPhone 16 Pro ($1199)
        SMARTCART_PRODUCTS[SMARTCART_PRODUCTS.length - 1], // AirPods Pro 2 ($249)
      ],
      description: "iPhone 16 Pro Titanium + AirPods Pro 2 with Adaptive Audio and MagSafe USB-C.",
    },
    {
      title: "The Galaxy AI Power Bundle",
      budget: "$999.00",
      items: [
        SMARTCART_PRODUCTS[1], // Galaxy S24 ($999)
      ],
      description: "Samsung Galaxy S24 with Snapdragon 8 Gen 3 and 2600-nit Dynamic AMOLED screen.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090f] py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="rounded-3xl border border-slate-800 bg-[#0d1226] p-8 shadow-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-400 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>SmartCart Budget Guard</span>
          </div>
          <h1 className="text-3xl font-black text-white">Smart Budget Planner</h1>
          <p className="mt-1 text-sm text-slate-400">
            Set your target spending budget. Our autonomous optimizer prevents overspending and suggests value alternatives.
          </p>
        </div>

        {/* Budget Setup & Progress */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          
          {/* Target Input */}
          <div className="md:col-span-5 rounded-2xl border border-slate-800 bg-[#0a0e1e] p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Set Target Budget</h2>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-500">$</span>
              <input
                type="number"
                value={targetBudget}
                onChange={(e) => setTargetBudget(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-700 bg-[#060810] py-3.5 pl-9 pr-4 text-xl font-black text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {[800, 1200, 1500, 2500].map((val) => (
                <button
                  key={val}
                  onClick={() => setTargetBudget(val)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold ${
                    targetBudget === val
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Guard */}
          <div className="md:col-span-7 rounded-2xl border border-slate-800 bg-[#0a0e1e] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400">Current Bag Total: ${subtotal}.00</span>
                <span className="font-bold text-cyan-300">{spentPct}% Used</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-500"
                  style={{ width: `${spentPct}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#060810] p-3 text-xs border border-slate-800/80">
              <span className="text-slate-400">Remaining Safe Spend:</span>
              <span className="font-mono text-base font-bold text-cyan-300">${remaining}.00</span>
            </div>
          </div>

        </div>

        {/* Recommended Bundles */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Curated Smartphone Bundles</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {recommendedPackages.map((pkg) => (
              <div key={pkg.title} className="rounded-2xl border border-slate-800 bg-[#0d1226] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{pkg.title}</h3>
                  <span className="text-lg font-black text-cyan-300">{pkg.budget}</span>
                </div>
                <p className="text-xs text-slate-300">{pkg.description}</p>
                <div className="flex gap-3">
                  {pkg.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 rounded-xl bg-[#060810] p-2 border border-slate-800 flex-1">
                      <img src={item.image} alt={item.name} className="h-8 w-8 object-contain" />
                      <div className="text-[10px]">
                        <p className="font-bold text-white truncate">{item.name}</p>
                        <p className="text-slate-400">${item.price}.00</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    pkg.items.forEach((item) => addToCart(item));
                  }}
                  className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-colors"
                >
                  Add Bundle to Bag
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
