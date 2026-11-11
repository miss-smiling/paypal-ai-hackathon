"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, Star, ArrowRight, Sparkles, SlidersHorizontal } from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";
import { productService } from "@/lib/services";
import { Product } from "@/lib/types";
import { formatINR } from "@/lib/mockData";

export default function SearchModal() {
  const { searchModalOpen, setSearchModalOpen, addToCompare } = useSmartCart();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setResults(productService.getAll());
    } else {
      setQuery("");
    }
  }, [searchModalOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(productService.getAll());
    } else {
      setResults(productService.getAll({ search: query }));
    }
  }, [query]);

  if (!searchModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
      onClick={() => setSearchModalOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search laptops, smartphones, headphones, features..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setSearchModalOpen(false)}
            className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            ESC
          </button>
        </div>

        {/* Quick filters / category tags */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-100 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium shrink-0">Popular:</span>
          {["Laptops under ₹70k", "iPhone 15", "OLED display", "Sony ANC", "Galaxy S24"].map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 shrink-0 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-2">
          {results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No matching products found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for &quot;Lenovo&quot;, &quot;HP&quot;, &quot;Samsung&quot;, or &quot;OLED&quot;.
              </p>
            </div>
          ) : (
            results.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <Link
                  href={`/product/${product.id}`}
                  onClick={() => setSearchModalOpen(false)}
                  className="flex items-center gap-3.5 flex-1 min-w-0"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {product.brand}
                      </span>
                      <span className="text-xs text-slate-300">·</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {product.category}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 ml-auto sm:ml-0">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {product.rating}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 truncate transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                      {formatINR(product.price)}
                      <span className="text-slate-400 font-normal line-through ml-2 text-[11px]">
                        {formatINR(product.originalPrice)}
                      </span>
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2 pl-3 shrink-0">
                  <button
                    onClick={() => {
                      addToCompare(product.id);
                      setSearchModalOpen(false);
                    }}
                    title="Add to comparison"
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/product/${product.id}`}
                    onClick={() => setSearchModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>AI Powered Multi-Retailer Search</span>
          </span>
          <span>Showing {results.length} products</span>
        </div>
      </div>
    </div>
  );
}
