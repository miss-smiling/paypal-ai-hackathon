"use client";

import { useState } from "react";
import { ArrowRight, Star, Heart, ShoppingBag, SlidersHorizontal, Check, CheckCircle2 } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";
import { SMARTCART_PRODUCTS, SmartCartProduct } from "@/lib/smartcartData";

export default function BottomPillarsGrid() {
  const { addToCart, toggleCompare, isComparing, setQuickViewProduct, addToast } = useNovatek();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Best Deals products (iPhone 15, Galaxy S23, Pixel 8, OnePlus Nord 3)
  const bestDeals = SMARTCART_PRODUCTS.filter((p) => p.badge === "Sale");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      addToast("Subscribed to SmartCart", "Welcome to exclusive VIP hardware deals!", "success");
    }
  };

  return (
    <div className="py-8 sm:py-12 space-y-16">
      
      {/* 1. Best Deals Section matching sample */}
      <section id="best-deals" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between pb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Best Deals
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Top offers. Limited time only.
            </p>
          </div>

          <a
            href="#popular-smartphones"
            className="group flex items-center gap-1.5 text-sm font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestDeals.map((product: SmartCartProduct) => {
            const comparing = isComparing(product.id);

            return (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#0d1222]/90 p-5 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:bg-[#11172c] hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-500/10"
              >
                {/* Top Row: Percentage Discount Pill & Heart */}
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[11px] font-black text-white shadow-sm">
                    -{product.discountPct}%
                  </span>

                  <button
                    onClick={() => addToast("Saved to Wishlist", `${product.name} saved.`, "info")}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>

                {/* Product Image */}
                <div
                  onClick={() => setQuickViewProduct(product)}
                  className="relative my-4 flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-[#080b14]/90 p-4 transition-colors group-hover:bg-[#060910]"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain filter contrast-105 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Details */}
                <div>
                  <h3
                    onClick={() => setQuickViewProduct(product)}
                    className="text-base font-bold text-white cursor-pointer hover:text-cyan-300 transition-colors"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {product.storageOption || "128GB"} · {product.colorName || "Standard"}
                  </p>
                </div>

                {/* Price & Strikethrough */}
                <div className="mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-white">
                      ${product.price}.00
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-slate-500 line-through">
                        ${product.originalPrice}.00
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-xs text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span className="font-semibold text-white">{product.rating}</span>
                    <span className="text-slate-500">({(product.reviewCount / 1000).toFixed(1)}k)</span>
                  </div>
                </div>

                {/* Actions */}
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

      </section>

      {/* 2. Stay Connected Newsletter Banner matching sample */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-[#090e1e] via-[#0c142b] to-[#070a14] p-8 sm:p-12 shadow-2xl">
          
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            
            {/* Left: Newsletter Form */}
            <div className="z-10 lg:col-span-7 space-y-3">
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Stay Connected
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                Get the latest updates, offers and new arrivals directly in your inbox.
              </p>

              {subscribed ? (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Thank you for subscribing! Your 15% VIP coupon code is WELCOME15.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-4 flex max-w-md gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all hover:scale-105"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Right: Phone Visual & Cursive "Your Next Phone Awaits ♡" */}
            <div className="relative flex justify-center items-center lg:col-span-5">
              <div className="flex items-center gap-6">
                <img
                  src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=350&q=80"
                  alt="Phone"
                  className="w-28 sm:w-36 h-auto object-contain rounded-xl drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] filter contrast-110"
                />

                <div className="flex flex-col items-start">
                  <span className="font-serif italic text-lg sm:text-2xl font-bold text-slate-200">
                    Your Next Phone
                  </span>
                  <span className="font-serif italic text-lg sm:text-2xl font-bold text-cyan-300">
                    Awaits
                  </span>
                  <span className="text-rose-400 text-sm mt-1">♡</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
