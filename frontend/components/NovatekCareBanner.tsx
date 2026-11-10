"use client";

import { ArrowRight, Sparkles, Heart } from "lucide-react";

export default function NovatekCareBanner() {
  return (
    <section className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-r from-[#0b1329] via-[#0e1a38] to-[#070b18] p-8 sm:p-12 lg:p-16 shadow-2xl">
          
          {/* Ambient Lighting Glows */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-80 w-80 rounded-full bg-blue-600/15 blur-[100px]" />

          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            
            {/* Left Content */}
            <div className="z-10 lg:col-span-7 space-y-4">
              <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
                Limited Time Offer
              </span>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
                Up to 30% Off <br />
                <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  On Selected Smartphones
                </span>
              </h2>

              <p className="max-w-md text-sm text-slate-300 leading-relaxed">
                Upgrade to next-gen AI silicon, ultra-high resolution cameras, and all-day endurance with exclusive SmartCart seasonal savings.
              </p>

              {/* CTA Button */}
              <div className="pt-4">
                <a
                  href="#best-deals"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/40 transition-all duration-300 hover:bg-blue-500 hover:shadow-cyan-500/30 hover:scale-105"
                >
                  <span>Shop Deals</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Right Graphic: Smartphone Fan + Cursive "Better Faster Smarter ♡" */}
            <div className="relative flex justify-center items-center lg:col-span-5">
              <div className="relative flex items-center justify-center w-full max-w-[380px] aspect-square">
                
                {/* Glowing Halo */}
                <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-[80px]" />

                {/* Smartphone Fan Spread Visual */}
                <div className="relative flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80"
                    alt="Smartphone cluster"
                    className="w-56 h-auto object-contain rounded-2xl drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] filter contrast-110 -rotate-6 transform transition-transform duration-500 hover:rotate-0"
                  />
                </div>

                {/* Cursive Neon Script Badge matching sample screenshot */}
                <div className="absolute -bottom-2 right-0 sm:right-4 z-20 flex flex-col items-center justify-center rounded-2xl border border-cyan-400/40 bg-[#070b18]/90 px-4 py-3 shadow-xl backdrop-blur-md">
                  <span className="font-serif italic text-base sm:text-lg font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]">
                    Better Faster Smarter
                  </span>
                  <span className="text-xs text-rose-400">♡</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
