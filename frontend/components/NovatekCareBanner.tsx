"use client";

import { ArrowRight, ShieldCheck, CheckCircle2, Zap, HeartHandshake } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";

export default function NovatekCareBanner() {
  const { setIsCareModalOpen } = useNovatek();

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-r from-[#0a1024] via-[#0c142e] to-[#070b16] p-8 sm:p-12 lg:p-16 shadow-2xl">
          
          {/* Ambient Lighting Glows */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-80 w-80 rounded-full bg-blue-600/15 blur-[100px]" />

          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            
            {/* Left Content */}
            <div className="z-10 lg:col-span-7">
              <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
                NOVATEK CARE+
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
                Complete Protection <br />
                <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  For Your Devices
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-base text-slate-300 sm:text-lg leading-relaxed">
                Extended warranty, accidental liquid and drop protection, express replacement, and 24/7 priority certified engineer support.
              </p>

              {/* Benefits list */}
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Unlimited accidental drops & spill coverage</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Zap className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Next-day express device replacement</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>100% Genuine OEM Novatek parts</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <HeartHandshake className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Global coverage across 140+ countries</span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-8">
                <button
                  onClick={() => setIsCareModalOpen(true)}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/40 transition-all duration-300 hover:bg-blue-500 hover:shadow-cyan-500/30 hover:scale-105"
                >
                  <span>Learn More</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Right Graphic: 3D Shield with Checkmark + Devices */}
            <div className="relative flex justify-center items-center lg:col-span-5">
              <div className="relative flex items-center justify-center w-full max-w-[420px] aspect-square">
                
                {/* Glowing Shield Halo */}
                <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-[80px]" />

                {/* Background Devices Cluster */}
                <div className="absolute inset-0 flex items-center justify-center opacity-70">
                  {/* Laptop Mock */}
                  <img
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"
                    alt="Laptop"
                    className="absolute -top-4 w-56 rounded-lg opacity-40 filter contrast-125"
                  />
                  {/* Watch Mock */}
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80"
                    alt="Watch"
                    className="absolute -bottom-2 -left-2 w-28 rounded-full opacity-60 filter contrast-125"
                  />
                  {/* Phone Mock */}
                  <img
                    src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80"
                    alt="Phone"
                    className="absolute -bottom-2 -right-2 w-28 rounded-xl opacity-60 filter contrast-125"
                  />
                </div>

                {/* 3D Shield Emblem Foreground */}
                <div className="relative z-10 flex h-48 w-44 flex-col items-center justify-center rounded-b-[60px] rounded-t-2xl border-2 border-cyan-400 bg-gradient-to-b from-[#19326b] via-[#0e1d44] to-[#080f24] shadow-[0_0_50px_rgba(56,189,248,0.5),inset_0_0_30px_rgba(37,99,235,0.6)] animate-float">
                  
                  {/* Shield Inner Bevel & Specular Highlight */}
                  <div className="absolute inset-2 rounded-b-[50px] rounded-t-xl border border-cyan-300/40 bg-gradient-to-tr from-cyan-900/40 via-blue-900/30 to-white/10" />

                  {/* Shield Checkmark */}
                  <div className="relative z-20 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300 shadow-inner">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-10 w-10 text-white drop-shadow-[0_0_10px_#00f0ff]"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>

                  <span className="relative z-20 mt-2 text-[10px] font-black tracking-widest text-cyan-200 uppercase">
                    VERIFIED SECURE
                  </span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
