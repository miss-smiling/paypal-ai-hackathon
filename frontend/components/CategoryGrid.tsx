"use client";

import { ArrowRight } from "lucide-react";
import { CATEGORIES, CategoryInfo } from "@/lib/novatekData";

interface CategoryGridProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryGrid({ selectedCategory, onSelectCategory }: CategoryGridProps) {
  return (
    <section id="categories" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Shop By Category
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Explore our core engineered hardware ecosystems
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

        {/* Categories Grid (6 Cards exactly matching sample image) */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat: CategoryInfo) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <div
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.name);
                  // Smooth scroll to featured products
                  const el = document.getElementById("featured-products");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400"
                    : "border-slate-800/80 bg-[#0d111d]/80 hover:border-cyan-500/50 hover:bg-[#131929] hover:-translate-y-1.5 hover:shadow-xl"
                }`}
              >
                {/* Image Container with dark background */}
                <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-[#080a11]/90 p-3">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover rounded-lg filter contrast-105 transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080a11]/60 via-transparent to-transparent" />
                </div>

                {/* Category Name */}
                <div className="mt-3 text-center">
                  <h3
                    className={`text-sm font-bold transition-colors ${
                      isSelected ? "text-cyan-300" : "text-white group-hover:text-cyan-400"
                    }`}
                  >
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {cat.count} devices
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
