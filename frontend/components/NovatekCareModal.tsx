"use client";

import { X, ShieldCheck, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";

export default function NovatekCareModal() {
  const { isCareModalOpen, setIsCareModalOpen, addToast } = useNovatek();

  if (!isCareModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in"
      onClick={() => setIsCareModalOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-blue-500/30 bg-[#0a0e1c] p-6 sm:p-8 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsCareModalOpen(false)}
          className="absolute top-5 right-5 rounded-full border border-slate-800 bg-slate-900/80 p-2 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/40 text-cyan-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
              OFFICIAL COVERAGE
            </span>
            <h2 className="text-xl font-black text-white">SmartCart Care+ Protection</h2>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-300">
          Every device on SmartCart comes with 1-year limited manufacturer warranty. Upgrade to Care+ for complete peace of mind, accidental damage drops, and zero-deductible priority replacement.
        </p>

        {/* Plan Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          
          {/* Standard */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d1222] p-5">
            <h3 className="text-sm font-bold text-white">Care Extended</h3>
            <div className="mt-2 text-2xl font-black text-white">$49</div>
            <p className="text-[11px] text-slate-400 mt-1">2-Year Mechanical & Electrical Coverage</p>
            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Extends warranty to 2 full years</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>100% genuine parts guarantee</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Battery health replacement under 80%</span>
              </li>
            </ul>
            <button
              onClick={() => {
                addToast("Care Added", "Care Extended coverage added to your profile.", "success");
                setIsCareModalOpen(false);
              }}
              className="mt-6 w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-white hover:bg-slate-700"
            >
              Select Plan
            </button>
          </div>

          {/* Ultimate Care+ */}
          <div className="relative rounded-2xl border border-cyan-400/50 bg-gradient-to-b from-[#101935] to-[#0d1222] p-5 shadow-xl shadow-cyan-500/10">
            <div className="absolute -top-2.5 right-4 rounded-full bg-cyan-400 px-2.5 py-0.5 text-[10px] font-black text-slate-950 uppercase">
              POPULAR
            </div>
            <h3 className="text-sm font-bold text-white">Care+ Ultimate Protection</h3>
            <div className="mt-2 text-2xl font-black text-cyan-300">$99</div>
            <p className="text-[11px] text-slate-400 mt-1">Complete Accidental Drops, Liquid & Theft</p>
            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                <span>Unlimited accidental drop & spill claims</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                <span>24-Hour Express replacement delivery</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                <span>24/7 VIP certified engineer priority hotline</span>
              </li>
            </ul>
            <button
              onClick={() => {
                addToast("Care+ Activated", "Care+ Ultimate added to your shopping order.", "success");
                setIsCareModalOpen(false);
              }}
              className="mt-6 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500"
            >
              Add Care+ Ultimate ($99)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
