"use client";

import { use } from "react";
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
  Cpu,
  BatteryCharging,
  Wifi,
  HardDrive,
  Layers,
} from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";
import { NOVATEK_PRODUCTS } from "@/lib/novatekData";

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { addToCart, toggleCompare, isComparing } = useNovatek();

  const product =
    NOVATEK_PRODUCTS.find((p) => p.id === resolvedParams.id) ||
    NOVATEK_PRODUCTS.find((p) => p.id.includes(resolvedParams.id)) ||
    NOVATEK_PRODUCTS[0];

  const inCompare = isComparing(product.id);

  return (
    <div className="min-h-screen bg-[#07090f] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Store</span>
          </Link>
          <span>/</span>
          <span className="text-slate-500">{product.category}</span>
          <span>/</span>
          <span className="text-cyan-400 font-semibold">{product.name}</span>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* Left: Product Imagery Showcase */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="relative flex aspect-square w-full max-w-lg items-center justify-center rounded-3xl border border-slate-800 bg-[#0d111d] p-8 shadow-2xl">
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

            {/* Micro Guarantees */}
            <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-lg text-xs text-slate-400">
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0c101c] p-3">
                <Truck className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Free Express Shipping</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0c101c] p-3">
                <RefreshCw className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>30-Day Money Back</span>
              </div>
            </div>
          </div>

          {/* Right: Technical Specs & Purchasing Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {product.category}
                </span>
                <span className="text-slate-600">·</span>
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span className="font-bold text-white">{product.rating}</span>
                  <span className="text-slate-500">({product.reviewCount} reviews)</span>
                </div>
                <span className="text-slate-600">·</span>
                <div className="flex items-center gap-1 text-xs text-cyan-400 font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{product.trustScore}% Verified Trust</span>
                </div>
              </div>

              <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                {product.name}
              </h1>

              <p className="mt-2 text-sm text-cyan-300 font-medium">
                {product.tagline}
              </p>

              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                {product.description}
              </p>

              {/* Price Row */}
              <div className="mt-6 flex items-baseline gap-4 border-y border-slate-800/80 py-4">
                <span className="text-3xl font-black text-white">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-base text-slate-500 line-through">
                    ${product.originalPrice}
                  </span>
                )}
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400 ml-auto">
                  In Stock & Ready for Dispatch
                </span>
              </div>

              {/* Engineered Features */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Engineered Highlights
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Specifications Matrix */}
              <div className="mt-6 rounded-2xl border border-slate-800 bg-[#0b0f1d] p-4 space-y-2 text-xs">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Hardware Specifications</span>
                </h4>
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-slate-800/60 pb-1.5 pt-1">
                    <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                    <span className="font-semibold text-slate-200 text-right max-w-xs">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 pt-6 sm:flex-row">
              <button
                onClick={() => addToCart(product)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all hover:scale-105"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Shopping Bag</span>
              </button>

              <button
                onClick={() => toggleCompare(product)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-6 py-4 text-sm font-semibold transition-all ${
                  inCompare
                    ? "border-cyan-400 bg-cyan-500 text-slate-950 font-bold"
                    : "border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>{inCompare ? "In Compare Matrix" : "Add to Compare"}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
