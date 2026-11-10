"use client";

import { Truck, ShieldCheck, Headphones, RefreshCw } from "lucide-react";

export default function ValuePropositionBar() {
  const valueProps = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On orders over $50",
      accent: "text-blue-400",
    },
    {
      icon: ShieldCheck,
      title: "Secure Payment",
      description: "100% secure payments",
      accent: "text-cyan-400",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "We're here to help",
      accent: "text-indigo-400",
    },
    {
      icon: RefreshCw,
      title: "Easy Returns",
      description: "30-day return policy",
      accent: "text-blue-400",
    },
  ];

  return (
    <section className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6">
      <div className="rounded-2xl border border-slate-800/80 bg-[#0d1222]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group flex items-center gap-4 rounded-xl border border-transparent p-2 transition-all duration-300 hover:bg-slate-800/40"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/50 text-slate-300 transition-colors group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10">
                  <Icon className={`h-6 w-6 ${item.accent}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
