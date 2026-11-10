"use client";

import { useState } from "react";
import { Search, X, ArrowRight, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen, products, addToCart, setQuickViewProduct } = useNovatek();
  const [query, setQuery] = useState("");

  if (!isSearchOpen) return null;

  const quickTags = ["iPhone 16 Pro", "Galaxy S24", "Pixel 9", "OnePlus 12", "Titanium", "AirPods"];

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.tagline.toLowerCase().includes(query.toLowerCase()) ||
          Object.values(p.specs).some(
            (val) => typeof val === "string" && val.toLowerCase().includes(query.toLowerCase())
          )
      )
    : products.slice(0, 4);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 p-4 pt-20 backdrop-blur-md animate-fade-in"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0c101d] shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-4">
          <Search className="h-5 w-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SmartCart smartphones, chips, cameras, or specs..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 overflow-x-auto bg-[#07090f] px-4 py-3 border-b border-slate-800 no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Popular:</span>
          {quickTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="rounded-full border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-500/50 hover:text-white"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No devices found matching &quot;{query}&quot;. Try searching for &quot;Audio&quot;, &quot;Phone&quot;, or &quot;M2&quot;.
            </div>
          ) : (
            filtered.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  setQuickViewProduct(product);
                  setIsSearchOpen(false);
                }}
                className="group flex cursor-pointer items-center justify-between rounded-xl border border-transparent p-2.5 transition-colors hover:border-slate-800 hover:bg-slate-900/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#07090e] p-1.5 border border-slate-800">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{product.tagline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white">${product.price}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                      setIsSearchOpen(false);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-[#07090f] px-4 py-2.5 text-[11px] text-slate-500 flex justify-between">
          <span>Press ESC or click outside to dismiss</span>
          <span>{filtered.length} products found</span>
        </div>
      </div>
    </div>
  );
}
