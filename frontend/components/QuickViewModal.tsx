"use client";

import { X, Star, ShieldCheck, Check, ShoppingBag, SlidersHorizontal, BatteryCharging, Cpu, HardDrive, Wifi } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";

export default function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleCompare, isComparing } = useNovatek();

  if (!quickViewProduct) return null;

  const comparing = isComparing(quickViewProduct.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in"
      onClick={() => setQuickViewProduct(null)}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-700/80 bg-[#0c101d] p-6 sm:p-8 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-5 right-5 z-10 rounded-full border border-slate-800 bg-slate-900/80 p-2 text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          
          {/* Left: Product Image */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-[#07090f] p-6 border border-slate-800/80">
            <div className="relative aspect-square w-full max-w-[280px]">
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                className="h-full w-full object-contain filter contrast-105"
              />
            </div>

            {quickViewProduct.badge && (
              <span className="mt-4 rounded-full bg-blue-600/20 border border-blue-500/40 px-3 py-1 text-xs font-bold text-cyan-300">
                {quickViewProduct.badge}
              </span>
            )}
          </div>

          {/* Right: Specs & Actions */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  {quickViewProduct.category}
                </span>
                <span className="text-slate-600">·</span>
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span className="font-bold text-white">{quickViewProduct.rating}</span>
                  <span className="text-slate-500">({quickViewProduct.reviewCount})</span>
                </div>
              </div>

              <h2 className="mt-2 text-2xl font-black text-white">
                {quickViewProduct.name}
              </h2>

              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                {quickViewProduct.description}
              </p>

              {/* Price Row */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-black text-white">
                  ${quickViewProduct.price}
                </span>
                {quickViewProduct.originalPrice && (
                  <span className="text-sm text-slate-500 line-through">
                    ${quickViewProduct.originalPrice}
                  </span>
                )}
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                  In Stock & Ready to Ship
                </span>
              </div>

              {/* Specs Grid */}
              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-800 pt-4 text-[11px]">
                {quickViewProduct.specs.processor && (
                  <div className="flex items-start gap-1.5 text-slate-300">
                    <Cpu className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{quickViewProduct.specs.processor}</span>
                  </div>
                )}
                {quickViewProduct.specs.battery && (
                  <div className="flex items-start gap-1.5 text-slate-300">
                    <BatteryCharging className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{quickViewProduct.specs.battery}</span>
                  </div>
                )}
                {quickViewProduct.specs.connectivity && (
                  <div className="flex items-start gap-1.5 text-slate-300">
                    <Wifi className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{quickViewProduct.specs.connectivity}</span>
                  </div>
                )}
                {quickViewProduct.specs.build && (
                  <div className="flex items-start gap-1.5 text-slate-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{quickViewProduct.specs.build}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center gap-3 border-t border-slate-800 pt-5">
              <button
                onClick={() => {
                  addToCart(quickViewProduct);
                  setQuickViewProduct(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={() => toggleCompare(quickViewProduct)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold transition-all ${
                  comparing
                    ? "border-cyan-400 bg-cyan-500 text-slate-950 font-bold"
                    : "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600 hover:text-white"
                }`}
              >
                {comparing ? (
                  <>
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>In Compare</span>
                  </>
                ) : (
                  <>
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Compare</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
