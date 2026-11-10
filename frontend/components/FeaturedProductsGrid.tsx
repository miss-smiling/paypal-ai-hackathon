"use client";

import { ArrowRight, ShoppingBag, SlidersHorizontal, Check, Star, Heart, Eye } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";
import { SmartCartProduct } from "@/lib/smartcartData";

interface FeaturedProductsGridProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function FeaturedProductsGrid({
  selectedCategory,
  onSelectCategory,
}: FeaturedProductsGridProps) {
  const { products, addToCart, toggleCompare, isComparing, setQuickViewProduct, addToast } = useNovatek();

  const smartphones = products.filter((p) => p.category === "Smartphones").slice(0, 4);

  const displayList =
    selectedCategory === "All"
      ? smartphones
      : products.filter((p) => p.category === selectedCategory || p.brand === selectedCategory);

  return (
    <section id="popular-smartphones" className="py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header matching sample image */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between pb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Popular Smartphones
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Discover the most loved devices by our customers.
            </p>
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

        {/* 4 Cards Grid matching sample */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayList.map((product: SmartCartProduct) => {
            const comparing = isComparing(product.id);

            return (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#0d1222]/90 p-5 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:bg-[#11172c] hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-500/10"
              >
                {/* Top Row: Badge & Wishlist Heart */}
                <div className="flex items-center justify-between">
                  {product.badge ? (
                    <span className="rounded-full bg-blue-600 px-3 py-0.5 text-[11px] font-bold text-white shadow-sm">
                      {product.badge}
                    </span>
                  ) : (
                    <div />
                  )}

                  {/* Wishlist Heart Icon */}
                  <button
                    onClick={() => addToast("Saved to Wishlist", `${product.name} saved to your favorites.`, "info")}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>

                {/* Product Image Showcase */}
                <div
                  onClick={() => setQuickViewProduct(product)}
                  className="relative my-4 flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-[#080b14]/90 p-4 transition-colors group-hover:bg-[#060910]"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain filter contrast-105 transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Hover Quick View Button */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-slate-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg">
                      <Eye className="h-3.5 w-3.5 text-cyan-400" />
                      Quick View
                    </span>
                  </div>
                </div>

                {/* Title & Storage / Color */}
                <div>
                  <h3
                    onClick={() => setQuickViewProduct(product)}
                    className="text-base font-bold text-white cursor-pointer hover:text-cyan-300 transition-colors"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {product.storageOption || "256GB"} · {product.colorName || "Titanium"}
                  </p>
                </div>

                {/* Pricing & Rating */}
                <div className="mt-3">
                  <div className="text-lg font-black text-white">
                    ${product.price}.00
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-xs text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span className="font-semibold text-white">{product.rating}</span>
                    <span className="text-slate-500">({(product.reviewCount / 1000).toFixed(1)}k reviews)</span>
                  </div>
                </div>

                {/* Action Buttons: Add to Cart (Pill) + Quick Compare */}
                <div className="mt-5 flex items-center gap-2 border-t border-slate-800/80 pt-3">
                  <button
                    onClick={() => addToCart(product)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/30 hover:bg-blue-500 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => toggleCompare(product)}
                    title={comparing ? "Remove from comparison" : "Add to comparison"}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                      comparing
                        ? "border-cyan-400 bg-cyan-500 text-slate-950 font-bold"
                        : "border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-slate-600"
                    }`}
                  >
                    {comparing ? <Check className="h-4 w-4 stroke-[3]" /> : <SlidersHorizontal className="h-4 w-4" />}
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
