"use client";

import Link from "next/link";
import { Star, ShieldCheck, ShoppingBag, Trash2, ArrowRight, Heart } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";
import { SMARTCART_PRODUCTS } from "@/lib/smartcartData";

export default function WatchlistPage() {
  const { addToCart, setQuickViewProduct } = useNovatek();
  const watchlistItems = [SMARTCART_PRODUCTS[0], SMARTCART_PRODUCTS[1], SMARTCART_PRODUCTS[2]];

  return (
    <div className="min-h-screen bg-[#07090f] py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="rounded-3xl border border-slate-800 bg-[#0d1226] p-8 shadow-2xl flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-400 mb-2">
              <Heart className="h-3.5 w-3.5 fill-cyan-400" />
              <span>Saved Tech Devices</span>
            </div>
            <h1 className="text-3xl font-black text-white">Your Watchlist</h1>
            <p className="mt-1 text-sm text-slate-400">
              Track live pricing drops, inventory availability, and restock notifications for your favorite smartphones.
            </p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {watchlistItems.map((product) => (
            <div
              key={product.id}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0a0e1e] p-5 hover:border-cyan-500/40 transition-colors"
            >
              <div
                onClick={() => setQuickViewProduct(product)}
                className="flex items-center gap-4 cursor-pointer w-full sm:w-auto"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#060810] p-2 border border-slate-800">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white hover:text-cyan-300">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400">{product.storageOption || "256GB"} · {product.colorName || product.brand}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-cyan-400">
                    <span className="font-bold">${product.price}.00</span>
                    {product.originalPrice && (
                      <span className="text-slate-500 line-through">
                        ${product.originalPrice}.00
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => addToCart(product)}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Bag</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
