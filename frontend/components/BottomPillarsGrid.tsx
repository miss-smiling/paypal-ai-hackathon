"use client";

import { RefreshCw, CreditCard, Gift, GraduationCap } from "lucide-react";

export default function BottomPillarsGrid() {
  const pillars = [
    {
      icon: RefreshCw,
      title: "Trade-In & Save",
      description: "Upgrade and save with trade-in",
      accent: "text-blue-400",
      details: "Get up to $650 instant credit when trading in your eligible smartphone or laptop.",
    },
    {
      icon: CreditCard,
      title: "Flexible Payments",
      description: "Buy now, pay later with easy EMIs",
      accent: "text-cyan-400",
      details: "0% APR financing with PayPal Pay in 4 or 12/24-month installments.",
    },
    {
      icon: Gift,
      title: "Gift Cards",
      description: "The perfect gift for every tech lover",
      accent: "text-indigo-400",
      details: "Digital gift cards delivered instantly with personalized animated greeting.",
    },
    {
      icon: GraduationCap,
      title: "Student Discounts",
      description: "Exclusive deals for students",
      accent: "text-blue-400",
      details: "Extra 10% off for verified university students, educators, and researchers.",
    },
  ];

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#0d111d]/90 p-6 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:bg-[#121829] hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/50 text-slate-300 transition-colors group-hover:border-cyan-400/50 group-hover:bg-cyan-500/10">
                    <Icon className={`h-6 w-6 ${pillar.accent}`} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors">
                    {pillar.details}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
