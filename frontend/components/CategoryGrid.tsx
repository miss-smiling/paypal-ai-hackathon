"use client";

import { ArrowRight } from "lucide-react";
import { BRANDS, BrandInfo } from "@/lib/smartcartData";

interface CategoryGridProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryGrid({ selectedCategory, onSelectCategory }: CategoryGridProps) {
  return (
    <section id="categories" className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching sample image: Shop by Brand */}
        <div className="flex items-center justify-between pb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Shop by Brand
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Browse premier global hardware manufacturers verified on SmartCart
            </p>
          </div>

          <button
            onClick={() => onSelectCategory("All")}
            className="group flex items-center gap-1.5 text-sm font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Brand Cards Grid (6 Brands matching sample) */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {BRANDS.map((brand: BrandInfo) => {
            const isSelected = selectedCategory === brand.name;

            return (
              <div
                key={brand.id}
                onClick={() => {
                  onSelectCategory(brand.name);
                  const el = document.getElementById("popular-smartphones");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className={`group flex flex-col items-center justify-center cursor-pointer rounded-2xl border p-6 text-center transition-all duration-300 ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400"
                    : "border-slate-800/80 bg-[#0d1222]/80 hover:border-cyan-500/50 hover:bg-[#12192e] hover:-translate-y-1 hover:shadow-xl"
                }`}
              >
                {/* Brand Logo Box */}
                <div className="flex h-12 w-full items-center justify-center rounded-xl bg-[#080b15] px-3 border border-slate-800 group-hover:border-cyan-500/30 transition-colors">
                  <span className="text-sm font-black tracking-wider text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {brand.logoText}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                    {brand.name}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {brand.count} Models
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
