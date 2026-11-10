"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Sparkles, Volume2, ShieldCheck, BatteryCharging, Globe } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";

export default function HeroSection() {
  const { addToCart, setQuickViewProduct, products } = useNovatek();
  const heroProduct = products.find((p) => p.id === "novasound-max") || products[0];

  const taglines = [
    {
      code: "ENG",
      name: "English",
      badge: "TECHNOLOGY FOR LIFE",
      headlineLine1: "Upgrade",
      headlineLine2: "Your World",
      subtitle:
        "SmartCart AI: Discover innovative tech that powers your lifestyle with autonomous multi-agent verification, real-time value comparisons, and PayPal checkout.",
      ctaPrimary: "Shop Now",
      ctaSecondary: "Explore Deals",
    },
    {
      code: "HIN",
      name: "हिन्दी",
      badge: "जीवन के लिए तकनीक",
      headlineLine1: "अपनी दुनिया को",
      headlineLine2: "अपग्रेड करें",
      subtitle:
        "स्मार्टकार्ट एआई: अपनी जीवनशैली को सशक्त बनाने वाली अत्याधुनिक तकनीक खोजें, सत्यापित समीक्षाओं और रीयल-टाइम तुलना के साथ।",
      ctaPrimary: "अभी खरीदें",
      ctaSecondary: "ऑफ़र देखें",
    },
    {
      code: "KAN",
      name: "ಕನ್ನಡ",
      badge: "ಜೀವನಕ್ಕಾಗಿ ತಂತ್ರಜ್ಞಾನ",
      headlineLine1: "ನಿಮ್ಮ ಜಗತ್ತನ್ನು",
      headlineLine2: "ನವೀಕರಿಸಿ",
      subtitle:
        "ಸ್ಮಾರ್ಟ್‌ಕಾರ್ಟ್ ಎಐ: ನಿಮ್ಮ ಜೀವನಶೈಲಿಗೆ ಶಕ್ತಿ ನೀಡುವ ನವೀನ ತಂತ್ರಜ್ಞಾನವನ್ನು ಅನ್ವೇಷಿಸಿ, ಪರಿಶೀಲಿಸಿದ ವಿಮರ್ಶೆಗಳು ಮತ್ತು ನೈಜ-ಸಮಯದ ಹೋಲಿಕೆಯೊಂದಿಗೆ.",
      ctaPrimary: "ಈಗಲೇ ಖರೀದಿಸಿ",
      ctaSecondary: "ಡೀಲ್‌ಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
    },
  ];

  const [activeLangIndex, setActiveLangIndex] = useState(0);
  const [isAutoCycling, setIsAutoCycling] = useState(true);

  useEffect(() => {
    if (!isAutoCycling) return;
    const interval = setInterval(() => {
      setActiveLangIndex((prev) => (prev + 1) % taglines.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoCycling, taglines.length]);

  const current = taglines[activeLangIndex];

  return (
    <section className="relative overflow-hidden pt-8 pb-20 lg:pt-14 lg:pb-28">
      {/* Background ambient neon glow lights */}
      <div className="pointer-events-none absolute top-1/4 left-1/3 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/15 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[160px]" />
      <div className="pointer-events-none absolute -top-10 right-10 -z-10 h-72 w-72 rounded-full bg-indigo-600/10 blur-[100px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Language Switcher Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/80 bg-[#0c101e]/80 p-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Globe className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-white">SmartCart AI Multilingual Tagline:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {taglines.map((t, idx) => (
              <button
                key={t.code}
                onClick={() => {
                  setActiveLangIndex(idx);
                  setIsAutoCycling(false);
                }}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
                  activeLangIndex === idx
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30"
                    : "border border-slate-800 bg-[#080b15] text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {t.name} ({t.code})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-6 z-10">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold tracking-widest text-cyan-400 uppercase transition-all duration-300">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-cyan-300" />
              <span>{current.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.08] transition-all duration-300">
              {current.headlineLine1} <br />
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                {current.headlineLine2}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-lg text-lg text-slate-300 leading-relaxed font-normal min-h-[5rem] transition-all duration-300">
              {current.subtitle}
            </p>

            {/* Multilingual Pill Bar */}
            <div className="mt-4 rounded-xl border border-slate-800/80 bg-[#090d1a] p-3 text-xs space-y-1">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="font-bold text-cyan-400">ENG:</span>
                <span>Technology For Life · Upgrade Your World</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="font-bold text-cyan-400">HIN:</span>
                <span>जीवन के लिए तकनीक · अपनी दुनिया को अपग्रेड करें</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="font-bold text-cyan-400">KAN:</span>
                <span>ಜೀವನಕ್ಕಾಗಿ ತಂತ್ರಜ್ಞಾನ · ನಿಮ್ಮ ಜಗತ್ತನ್ನು ನವೀಕರಿಸಿ</span>
              </div>
            </div>

            {/* Action Buttons matching screenshot */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#featured-products"
                className="group inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/35 transition-all duration-300 hover:bg-blue-500 hover:shadow-cyan-500/40 hover:scale-105"
              >
                <span>{current.ctaPrimary}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="#categories"
                className="group inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-7 py-4 text-base font-semibold text-slate-300 backdrop-blur-md transition-all duration-300 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white"
              >
                <span>{current.ctaSecondary}</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 text-slate-400" />
              </a>
            </div>

            {/* Trust Micro-Metrics */}
            <div className="mt-10 flex items-center gap-6 border-t border-slate-800/80 pt-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>2-Year Global Warranty</span>
              </div>
              <div className="h-3 w-px bg-slate-800" />
              <div className="flex items-center gap-2">
                <BatteryCharging className="h-4 w-4 text-cyan-400" />
                <span>Next-Gen GaN & Silicon</span>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Headphones on Cybernetic Pedestal */}
          <div className="relative lg:col-span-6 flex justify-center items-center">
            
            {/* The Cyber Pedestal (Circular glowing base matching screenshot) */}
            <div className="relative flex items-center justify-center w-full max-w-[520px] aspect-square">
              
              {/* Outer Ambient Glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/20 via-cyan-500/25 to-transparent blur-[70px] -z-10" />

              {/* Pedestal Base Disc: 3D Ellipse Base */}
              <div className="absolute bottom-4 w-[85%] h-24 rounded-[100%] bg-gradient-to-b from-[#111625] to-[#07090e] border border-cyan-500/40 shadow-[0_0_60px_rgba(37,99,235,0.45)] transform rotate-0" />
              
              {/* Neon Glow Ring on the Pedestal rim */}
              <div className="absolute bottom-10 w-[78%] h-20 rounded-[100%] border-2 border-cyan-400/80 shadow-[0_0_30px_#00f0ff,inset_0_0_20px_#2563eb] animate-pulse-glow" />
              <div className="absolute bottom-12 w-[70%] h-14 rounded-[100%] bg-gradient-to-t from-cyan-950/60 to-[#0d121f] border border-cyan-300/30 blur-[1px]" />
              
              {/* Floor Blue Light Specular Reflection */}
              <div className="absolute bottom-6 w-[50%] h-8 rounded-[100%] bg-cyan-400/30 blur-md" />

              {/* Floating Headphone Visual with subtle breathing/floating animation */}
              <div className="relative z-10 w-[78%] max-w-[380px] animate-float transition-transform duration-500 hover:scale-105">
                {/* High-res studio headphone render with dark background blend */}
                <div className="relative group cursor-pointer" onClick={() => setQuickViewProduct(heroProduct)}>
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85"
                    alt="NovaSound Max Flagship Studio Headphones"
                    className="w-full h-auto object-contain rounded-2xl drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] filter contrast-105"
                  />

                  {/* Quick-Action Hover Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-[#080a11]/90 via-transparent to-transparent rounded-2xl">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(heroProduct);
                      }}
                      className="rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/50 hover:bg-cyan-500 transition-all transform translate-y-2 group-hover:translate-y-0"
                    >
                      Quick Add to Bag · $349
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Tech Spec Badges */}
              <div className="absolute top-10 right-4 hidden sm:flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-[#0d1222]/80 px-3.5 py-2 backdrop-blur-md shadow-xl animate-float-slow">
                <Volume2 className="h-4 w-4 text-cyan-400" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Acoustics</div>
                  <div className="text-xs font-bold text-white">45dB Adaptive ANC</div>
                </div>
              </div>

              <div className="absolute bottom-28 left-0 hidden sm:flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-[#0d1222]/80 px-3.5 py-2 backdrop-blur-md shadow-xl animate-float">
                <BatteryCharging className="h-4 w-4 text-blue-400" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Ultra Battery</div>
                  <div className="text-xs font-bold text-white">50h Lossless Audio</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
