"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Check,
  ArrowLeft,
  Truck,
  RefreshCw,
  Plus,
  Minus,
  Heart,
} from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";
import { SMARTCART_PRODUCTS } from "@/lib/smartcartData";

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { addToCart, toggleCompare, isComparing, addToast } = useNovatek();

  const product =
    SMARTCART_PRODUCTS.find((p) => p.id === resolvedParams.id) ||
    SMARTCART_PRODUCTS.find((p) => p.id.includes(resolvedParams.id)) ||
    SMARTCART_PRODUCTS[0];

  const inCompare = isComparing(product.id);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);

  const colors = [
    { name: "Titanium Blue", bg: "bg-blue-900" },
    { name: "Natural Titanium", bg: "bg-stone-500" },
    { name: "White Titanium", bg: "bg-slate-200" },
    { name: "Black Titanium", bg: "bg-neutral-800" },
  ];

  return (
    <div className="min-h-screen bg-[#07090f] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-white transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>SmartCart Store</span>
            </Link>
            <span>/</span>
            <span className="text-slate-500">{product.category}</span>
            <span>/</span>
            <span className="text-cyan-400 font-semibold">{product.name}</span>
          </div>

          <button
            onClick={() => addToast("Saved to Wishlist", `${product.name} saved.`, "info")}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400"
          >
            <Heart className="h-4 w-4" />
            <span>Save</span>
          </button>
        </div>

        {/* Product Details Grid matching sample mobile layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          
          {/* Left: Product Imagery Showcase */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="relative flex aspect-square w-full max-w-md items-center justify-center rounded-3xl border border-slate-800 bg-[#0d1226] p-8 shadow-2xl">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-transparent blur-2xl" />
              <img
                src={product.image}
                alt={product.name}
                className="relative z-10 h-full w-full object-contain filter contrast-105"
              />
              {product.badge && (
                <span className="absolute top-6 left-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Guarantees */}
            <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-md text-xs text-slate-400">
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0a0e1e] p-3">
                <Truck className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Free Express Shipping</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0a0e1e] p-3">
                <RefreshCw className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>30-Day Easy Returns</span>
              </div>
            </div>
          </div>

          {/* Right: Technical Specs & Purchasing Actions */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white sm:text-4xl">
                {product.name}
              </h1>

              <p className="mt-1 text-xs text-slate-400">
                {product.storageOption || "256GB"} · {colors[selectedColor].name}
              </p>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span className="font-bold text-white">{product.rating}</span>
                </div>
                <span className="text-slate-500">({(product.reviewCount / 1000).toFixed(1)}k reviews)</span>
                <span className="text-slate-600">·</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {product.trustScore}% Verified Trust
                </span>
              </div>

              {/* Price */}
              <div className="mt-4 text-3xl font-black text-white">
                ${product.price}.00
              </div>

              {/* Description */}
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                {product.description}
              </p>

              {/* Specs Pills Grid matching the sample mobile screen */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-xl border border-slate-800 bg-[#0a0e1e] p-3 text-center">
                  <span className="text-xs font-bold text-white block">6.3&quot;</span>
                  <span className="text-[10px] text-slate-400">Display</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0a0e1e] p-3 text-center">
                  <span className="text-xs font-bold text-white block">256GB</span>
                  <span className="text-[10px] text-slate-400">Storage</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0a0e1e] p-3 text-center">
                  <span className="text-xs font-bold text-white block">A18 Pro</span>
                  <span className="text-[10px] text-slate-400">Chip</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0a0e1e] p-3 text-center">
                  <span className="text-xs font-bold text-white block">5G Ready</span>
                  <span className="text-[10px] text-slate-400">Cellular</span>
                </div>
              </div>

              {/* Color selector matching sample */}
              <div className="mt-6">
                <span className="text-xs font-bold text-slate-300 block mb-2">Color</span>
                <div className="flex items-center gap-3">
                  {colors.map((c, idx) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(idx)}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${c.bg} ${
                        selectedColor === idx ? "border-cyan-400 scale-110 shadow-lg shadow-cyan-500/30" : "border-transparent"
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Quantity Selector & Add to Cart button */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900/80 px-2 py-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-slate-400 hover:text-white"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-3 text-sm font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-slate-400 hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Cart (${product.price * quantity}.00)</span>
                </button>

                <button
                  onClick={() => toggleCompare(product)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-4 py-3.5 text-xs font-semibold transition-all ${
                    inCompare
                      ? "border-cyan-400 bg-cyan-500 text-slate-950 font-bold"
                      : "border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>{inCompare ? "Comparing" : "Compare"}</span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
