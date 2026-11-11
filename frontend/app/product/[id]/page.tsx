"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  GitCompare,
  Bot,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Layers,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";
import { productService, watchlistService } from "@/lib/services";
import { Product } from "@/lib/types";
import { formatINR } from "@/lib/mockData";
import PayPalLogo from "@/components/ui/PayPalLogo";
import { Gift, Tag } from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { addToCompare, isComparing, addToast } = useSmartCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  useEffect(() => {
    const found = productService.getById(resolvedParams.id) || productService.getAll()[0];
    if (found) {
      setProduct(found);
      setSelectedImage(found.image);
      const inWatchlist = watchlistService.get().some((w) => w.productId === found.id);
      setIsWatchlisted(inWatchlist);
    }
  }, [resolvedParams.id]);

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <Link href="/dashboard" className="text-sm font-semibold text-indigo-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const alternatives = productService.getAlternatives(product.id).slice(0, 3);

  const handleToggleWatchlist = () => {
    if (isWatchlisted) {
      const item = watchlistService.get().find((w) => w.productId === product.id);
      if (item) watchlistService.remove(item.id);
      setIsWatchlisted(false);
      addToast("Removed from Watchlist", `${product.name} untracked.`, "info");
    } else {
      watchlistService.add(product);
      setIsWatchlisted(true);
      addToast("Added to Watchlist", `${product.name} is now tracked for price drops.`, "success");
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/dashboard" className="hover:text-indigo-600">
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <Link href="/compare" className="hover:text-indigo-600">
          {product.category}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="font-semibold text-slate-900 truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square w-full rounded-3xl bg-white border border-slate-200 shadow-soft overflow-hidden p-6 flex items-center justify-center relative">
            <img
              src={selectedImage || product.image}
              alt={product.name}
              className="h-full w-full object-contain filter contrast-105"
            />
            {product.discountPct > 0 && (
              <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-xs">
                {product.discountPct}% OFF
              </span>
            )}
            <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-xs text-slate-800 border border-slate-200 shadow-2xs">
              {product.retailer}
            </span>
          </div>

          {/* Thumbnails */}
          {product.additionalImages && product.additionalImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.additionalImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`h-16 w-16 rounded-xl border p-1 bg-white shrink-0 overflow-hidden transition-all ${
                    selectedImage === img
                      ? "border-indigo-600 ring-2 ring-indigo-100"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Intelligence & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {product.brand}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">
                {product.category}
              </span>
              <div className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>{product.trustScore}% Verified Trust</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            <p className="text-xs text-slate-500 mt-1 italic font-medium">
              &quot;{product.tagline}&quot;
            </p>

            {/* Ratings & Seller */}
            <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm">{product.rating}</span>
                <span className="text-slate-400 font-normal">
                  ({product.reviewCount.toLocaleString()} verified ratings)
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">
                Seller: <strong className="text-slate-900">{product.specs.seller}</strong>
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                {formatINR(product.price)}
              </span>
              <span className="text-sm text-slate-400 line-through">
                {formatINR(product.originalPrice)}
              </span>
              <span className="text-xs font-bold text-emerald-600">
                Save {formatINR(product.originalPrice - product.price)} ({product.discountPct}% off)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-indigo-600" />
                {product.deliveryEstimate} ({product.deliveryCharge === 0 ? "Free Shipping" : formatINR(product.deliveryCharge)})
              </span>
              <span className="flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4 text-indigo-600" />
                {product.specs.returnPolicy || "7-Day Replacement"}
              </span>
            </div>
          </div>

          {/* DUAL PAYMENT & DISCOUNTS WORKFLOW */}
          <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/40 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-black shadow-xs">
                  %
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Dual Checkout: Choose Where &amp; How to Pay
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pay with PayPal on SmartCart for 10% off, or visit the retailer directly.
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Gift className="h-3 w-3 text-emerald-600" />
                <span>10% OFF with PayPal</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Pay using PayPal on SmartCart (10% Discount) */}
              <div className="relative rounded-2xl border-2 border-indigo-600 bg-white p-4 sm:p-5 shadow-md flex flex-col justify-between">
                <div className="absolute -top-3 left-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <span>★ Recommended · 10% OFF</span>
                </div>

                <div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-slate-900">
                      Pay on SmartCart
                    </span>
                    <PayPalLogo className="h-4" />
                  </div>

                  <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-indigo-700">
                        {formatINR(Math.round(product.price * 0.9))}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        {formatINR(product.price)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <Tag className="h-3.5 w-3.5" />
                      <span>
                        Save {formatINR(Math.round(product.price * 0.1))} (10% Total Discount)
                      </span>
                    </div>

                    <div className="mt-2 rounded-xl bg-indigo-50/80 border border-indigo-100 p-2 text-[11px] text-slate-600 space-y-1">
                      <p className="font-semibold text-indigo-900">
                        Registration Coupon: <span className="font-mono text-indigo-700 font-bold bg-white px-1.5 py-0.5 rounded border border-indigo-200">SMART10</span>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        *Register your free SmartCart account to claim this 10% coupon code at PayPal checkout.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <Link
                    href={`/checkout?productId=${product.id}&coupon=SMART10`}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#0070ba] hover:bg-[#005ea6] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01]"
                  >
                    <PayPalLogo variant="white" className="h-4" />
                    <span>Pay with PayPal (10% OFF)</span>
                  </Link>
                  <p className="text-[10px] text-center text-slate-400">
                    Official PayPal Buyer Protection Guarantee
                  </p>
                </div>
              </div>

              {/* Option 2: Visit Retailer & Pay Standard Price */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Visit Retailer
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide bg-white px-2 py-0.5 rounded border border-slate-200">
                      {product.retailer}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-2xl font-bold text-slate-800">
                      {formatINR(product.price)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Standard Retailer Price (No SmartCart 10% discount)
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Redirects to {product.retailer}&apos;s external store. You will pay the regular listing price.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5">
                  <a
                    href={product.retailerUrl || "https://amazon.in"}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Visit {product.retailer}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                  </a>
                  <p className="text-[10px] text-center text-slate-400">
                    Fulfilled directly by {product.retailer}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Action Tools */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleToggleWatchlist}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                isWatchlisted
                  ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Heart className={`h-4 w-4 ${isWatchlisted ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>{isWatchlisted ? "In Watchlist" : "Add to Watchlist"}</span>
            </button>

            <button
              onClick={() => addToCompare(product.id)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                isComparing(product.id)
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <GitCompare className="h-4 w-4" />
              <span>{isComparing(product.id) ? "Comparing" : "Compare Specs"}</span>
            </button>

            <Link
              href="/assistant"
              className="py-2.5 px-4 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Bot className="h-4 w-4" />
              <span>Ask CART</span>
            </Link>
          </div>

          {/* AI Verdict Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/80 border border-indigo-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>CART AI Verdict</span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {product.aiVerdict}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {product.aiSummary}
            </p>
          </div>
        </div>
      </div>

      {/* Specifications & Pros/Cons Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Full Specifications Table (7 cols) */}
        <div className="lg:col-span-7 saas-card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-600" />
            <span>Full Technical Specifications</span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="py-2.5 flex items-center justify-between">
                <span className="font-semibold text-slate-500 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <span className="font-medium text-slate-900 text-right max-w-xs">
                  {value || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pros & Cons and Review Sentiment (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pros & Cons */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Pros & Cons</h3>
            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-emerald-700 block mb-2">
                  Key Strengths
                </span>
                <ul className="space-y-1.5">
                  {product.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-rose-700 block mb-2">
                  Things to Keep in Mind
                </span>
                <ul className="space-y-1.5">
                  {product.cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Customer Sentiment Breakdown */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Customer Sentiment
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                {product.sentiment.overallScore}/100 Score
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Positive ({product.sentiment.positivePct}%)</span>
                <span>Negative ({product.sentiment.negativePct}%)</span>
              </div>
              <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-200">
                <div
                  className="bg-emerald-500"
                  style={{ width: `${product.sentiment.positivePct}%` }}
                />
                <div
                  className="bg-slate-400"
                  style={{ width: `${product.sentiment.neutralPct}%` }}
                />
                <div
                  className="bg-rose-500"
                  style={{ width: `${product.sentiment.negativePct}%` }}
                />
              </div>
            </div>

            {/* Price Movement point */}
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <TrendingDown className="h-3.5 w-3.5" />
                Current price is lowest in 30 days
              </span>
              <span className="text-[11px] text-slate-400">
                {product.priceHistory.length} data points
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Products Row */}
      {alternatives.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Alternative Recommendations
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Similar options in the same category worth comparing
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {alternatives.map((alt) => (
              <div
                key={alt.id}
                className="saas-card p-4 flex flex-col justify-between hover:border-indigo-300 transition-colors"
              >
                <div>
                  <div className="aspect-video w-full rounded-xl bg-slate-100 overflow-hidden mb-3">
                    <img
                      src={alt.image}
                      alt={alt.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                    {alt.name}
                  </h4>
                  <p className="text-xs font-semibold text-indigo-600 mt-1">
                    {formatINR(alt.price)}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{alt.brand}</span>
                  <Link
                    href={`/product/${alt.id}`}
                    className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
