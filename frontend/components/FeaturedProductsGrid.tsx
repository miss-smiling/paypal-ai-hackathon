"use client";

import { ArrowRight, ShoppingBag, SlidersHorizontal, Check, Star, ShieldCheck, Eye } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";
import { NovatekProduct } from "@/lib/novatekData";

interface FeaturedProductsGridProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function FeaturedProductsGrid({
  selectedCategory,
  onSelectCategory,
}: FeaturedProductsGridProps) {
  const { products, addToCart, toggleCompare, isComparing, setQuickViewProduct } = useNovatek();

  const filterCategories = [
    "All",
    "Smartphones",
    "Audio",
    "Laptops",
    "Wearables",
    "Accessories",
    "Smart Home",
  ];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <section id="featured-products" className="py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest">
              <span>Engineered Excellence</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Featured Products
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onSelectCategory("All")}
              className="group flex items-center gap-1.5 text-sm font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "border border-slate-800 bg-[#0d111d] text-slate-300 hover:border-slate-700 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid matching the 4-column layout in sample image */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product: NovatekProduct) => {
            const comparing = isComparing(product.id);

            return (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#0d111d]/90 p-5 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:bg-[#121829] hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-500/10"
              >
                {/* Top Row: Badge & Quick Compare Button */}
                <div className="flex items-center justify-between">
                  {product.badge ? (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        product.badge === "New"
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-500/40"
                          : product.badge === "Best Seller"
                          ? "bg-amber-600 text-white"
                          : product.badge === "Sale"
                          ? "bg-emerald-600 text-white"
                          : "bg-purple-600 text-white"
                      }`}
                    >
                      {product.badge}
                    </span>
                  ) : (
                    <div />
                  )}

                  {/* Compare Toggle Button */}
                  <button
                    onClick={() => toggleCompare(product)}
                    title={comparing ? "Remove from comparison" : "Add to comparison"}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                      comparing
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/40"
                        : "border border-slate-700/60 bg-slate-800/40 text-slate-300 hover:border-cyan-400/50 hover:text-white"
                    }`}
                  >
                    {comparing ? (
                      <>
                        <Check className="h-3 w-3 stroke-[3]" />
                        <span>Comparing</span>
                      </>
                    ) : (
                      <>
                        <SlidersHorizontal className="h-3 w-3" />
                        <span>Compare</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Product Image Area with Hover Quick-View */}
                <div
                  onClick={() => setQuickViewProduct(product)}
                  className="relative my-4 flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-[#080a11]/90 p-4 transition-colors group-hover:bg-[#07090e]"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain filter contrast-105 transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Hover Quick View Pill */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-slate-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg">
                      <Eye className="h-3.5 w-3.5 text-cyan-400" />
                      Quick View
                    </span>
                  </div>
                </div>

                {/* Rating & Trust Score */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span className="font-semibold text-white">{product.rating}</span>
                    <span className="text-slate-500">({product.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-cyan-400 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{product.trustScore}% Trust</span>
                  </div>
                </div>

                {/* Product Title */}
                <h3
                  onClick={() => setQuickViewProduct(product)}
                  className="mt-2 text-base font-bold text-white cursor-pointer hover:text-cyan-300 transition-colors"
                >
                  {product.name}
                </h3>

                {/* Short Spec Highlight */}
                <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                  {product.tagline}
                </p>

                {/* Pricing & Add to Cart Action */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-white">
                        {product.price > 500 && product.category === "Smartphones" || product.category === "Laptops"
                          ? `From $${product.price}`
                          : `$${product.price}`}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-500 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Shopping Bag Button */}
                  <button
                    onClick={() => addToCart(product)}
                    aria-label={`Add ${product.name} to shopping bag`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/80 text-white shadow-md transition-all duration-200 hover:border-cyan-400 hover:bg-blue-600 hover:scale-105 hover:shadow-cyan-500/20 active:scale-95"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
