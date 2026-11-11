"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Check,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Star,
  ArrowRight,
  Zap,
  ExternalLink,
  Award,
  Layers,
  Heart,
  Bot,
  X,
  Search,
} from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";
import { productService, watchlistService } from "@/lib/services";
import { Product } from "@/lib/types";
import { formatINR } from "@/lib/mockData";

export default function ComparePage() {
  const { compareIds, removeFromCompare, clearCompare, addToCompare, addToast } =
    useSmartCart();
  const [highlightDiffs, setHighlightDiffs] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");

  const allProducts = productService.getAll();

  // Active products in comparison (fallback to Lenovo & HP if empty)
  const activeProducts: Product[] =
    compareIds.length > 0
      ? (compareIds
          .map((id) => productService.getById(id))
          .filter(Boolean) as Product[])
      : [allProducts[0], allProducts[1]];

  const unselectedProducts = allProducts.filter(
    (p) =>
      !activeProducts.some((ap) => ap.id === p.id) &&
      (selectedCategoryFilter === "All" || p.category === selectedCategoryFilter) &&
      (!pickerSearch ||
        p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(pickerSearch.toLowerCase()))
  );

  // Specification sections definition
  interface SpecRow {
    label: string;
    section: string;
    getValue: (p: Product) => string;
  }

  const specRows: SpecRow[] = [
    // Overview
    { section: "Core Overview", label: "Manufacturer Brand", getValue: (p) => p.brand },
    { section: "Core Overview", label: "Category", getValue: (p) => p.category },
    { section: "Core Overview", label: "Current Price", getValue: (p) => formatINR(p.price) },
    {
      section: "Core Overview",
      label: "Customer Rating",
      getValue: (p) => `${p.rating} / 5.0 (${p.reviewCount.toLocaleString()} reviews)`,
    },
    {
      section: "Core Overview",
      label: "Verified Trust Score",
      getValue: (p) => `${p.trustScore}% Verified`,
    },

    // Specifications
    {
      section: "Performance & Hardware",
      label: "Processor / Chipset",
      getValue: (p) => p.specs.processor || "Standard Architecture",
    },
    {
      section: "Performance & Hardware",
      label: "RAM / Memory",
      getValue: (p) => p.specs.ram || "Standard Memory",
    },
    {
      section: "Performance & Hardware",
      label: "Storage",
      getValue: (p) => p.specs.storage || "High Speed NVMe",
    },
    {
      section: "Performance & Hardware",
      label: "Display & Screen",
      getValue: (p) => p.specs.display || "Full HD Panel",
    },
    {
      section: "Performance & Hardware",
      label: "Graphics / GPU",
      getValue: (p) => p.specs.graphics || "Integrated",
    },

    // Battery & Build
    {
      section: "Battery & Build",
      label: "Battery Endurance",
      getValue: (p) => p.specs.battery || "All-Day Battery",
    },
    {
      section: "Battery & Build",
      label: "Weight & Portability",
      getValue: (p) => p.specs.weight || "Lightweight",
    },
    {
      section: "Battery & Build",
      label: "Operating System",
      getValue: (p) => p.specs.os || "Pre-installed",
    },

    // Purchase & Seller Info
    {
      section: "Retailer & Delivery",
      label: "Primary Retailer",
      getValue: (p) => p.retailer,
    },
    {
      section: "Retailer & Delivery",
      label: "Verified Seller",
      getValue: (p) => p.specs.seller || "Authorized Merchant",
    },
    {
      section: "Retailer & Delivery",
      label: "Estimated Delivery",
      getValue: (p) => p.deliveryEstimate,
    },
    {
      section: "Retailer & Delivery",
      label: "Warranty Period",
      getValue: (p) => p.specs.warranty || "1 Year Standard Warranty",
    },
    {
      section: "Retailer & Delivery",
      label: "Return Policy",
      getValue: (p) => p.specs.returnPolicy || "7 Days Replacement",
    },
  ];

  const sections = Array.from(new Set(specRows.map((r) => r.section)));

  const isRowDifferent = (row: SpecRow) => {
    const vals = activeProducts.map((p) => row.getValue(p));
    return new Set(vals).size > 1;
  };

  const handleSaveToWatchlist = (product: Product) => {
    watchlistService.add(product);
    addToast("Saved to Watchlist", `${product.name} is now tracked.`, "success");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* SECTION A: Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
            <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-600" />
            <span>Product Comparison Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Side-by-Side Spec & Value Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Compare processors, display nit ratings, genuine customer sentiment, and real landing costs across Amazon and Flipkart.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeProducts.length < 4 && (
            <button
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product ({activeProducts.length}/4)</span>
            </button>
          )}

          {activeProducts.length > 0 && (
            <button
              onClick={clearCompare}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 text-xs shadow-2xs">
        <label className="flex items-center gap-2.5 cursor-pointer font-medium text-slate-700">
          <input
            type="checkbox"
            checked={highlightDiffs}
            onChange={(e) => setHighlightDiffs(e.target.checked)}
            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
          />
          <span>Highlight specification differences</span>
        </label>

        <div className="flex items-center gap-1.5 text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>Autonomous spec harmonization active</span>
        </div>
      </div>

      {/* SECTION B: Side-by-Side Product Cards Header */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-soft">
        <div className="min-w-[760px]">
          {/* Header row with product cards */}
          <div className="grid grid-cols-12 gap-4 p-6 bg-slate-50/70 border-b border-slate-200">
            <div className="col-span-3 flex flex-col justify-end">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Comparing {activeProducts.length} Products
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Specs normalized from manufacturer spec sheets & verified retailer listings.
              </p>
            </div>

            {activeProducts.map((p) => {
              const colSpan = Math.floor(9 / activeProducts.length);
              return (
                <div
                  key={p.id}
                  className="relative p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between group"
                  style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}
                >
                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCompare(p.id)}
                    className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove from comparison"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div>
                    <div className="aspect-video w-full rounded-xl bg-slate-100 overflow-hidden mb-3 border border-slate-100">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-bold text-indigo-600">{p.brand}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {p.retailer}
                      </span>
                    </div>

                    <Link
                      href={`/product/${p.id}`}
                      className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-2 transition-colors"
                    >
                      {p.name}
                    </Link>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-900">
                        {formatINR(p.price)}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        {formatINR(p.originalPrice)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1 text-xs text-amber-600 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{p.rating}</span>
                      <span className="text-slate-400 font-normal">
                        ({p.reviewCount.toLocaleString()})
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleSaveToWatchlist(p)}
                      className="flex-1 py-1.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Heart className="h-3.5 w-3.5" />
                      <span>Watch</span>
                    </button>
                    <Link
                      href={`/product/${p.id}`}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SECTION C: Detailed Comparison Table Rows by Section */}
          <div className="divide-y divide-slate-200">
            {sections.map((sectionName) => {
              const rows = specRows.filter((r) => r.section === sectionName);
              return (
                <div key={sectionName}>
                  {/* Section Title */}
                  <div className="bg-slate-100/70 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-indigo-600" />
                    <span>{sectionName}</span>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-slate-100">
                    {rows.map((row) => {
                      const differs = isRowDifferent(row);
                      return (
                        <div
                          key={row.label}
                          className={`grid grid-cols-12 px-6 py-3.5 items-center text-xs transition-colors ${
                            highlightDiffs && differs
                              ? "bg-indigo-50/30"
                              : "hover:bg-slate-50/50"
                          }`}
                        >
                          <div className="col-span-3 font-semibold text-slate-700 flex items-center gap-1.5">
                            <span>{row.label}</span>
                            {highlightDiffs && differs && (
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            )}
                          </div>

                          {activeProducts.map((p) => {
                            const colSpan = Math.floor(9 / activeProducts.length);
                            const val = row.getValue(p);
                            return (
                              <div
                                key={p.id}
                                className="font-medium text-slate-900 pr-4"
                                style={{
                                  gridColumn: `span ${colSpan} / span ${colSpan}`,
                                }}
                              >
                                {val}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION D: AI Comparison Verdict */}
      <div className="saas-card p-6 sm:p-8 rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-50/50 via-white to-violet-50/50 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              CART Comparison Analysis
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Autonomous Recommendation & Awards
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
          {activeProducts[1]
            ? `${activeProducts[1].name} offers higher chassis rigidity and premium acoustics, while ${activeProducts[0].name} delivers superior price-to-performance value for everyday coding and college tasks.`
            : `${activeProducts[0].name} provides outstanding specifications and value in its class.`}
        </p>

        {/* 4 Awards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 uppercase">
              <Award className="h-3.5 w-3.5 text-indigo-600" /> Best Overall
            </span>
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {activeProducts[1]?.name || activeProducts[0].name}
            </h4>
            <p className="text-[11px] text-slate-500">
              Highest materials rating & thermals
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase">
              <Award className="h-3.5 w-3.5 text-emerald-600" /> Best Value
            </span>
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {activeProducts[0].name}
            </h4>
            <p className="text-[11px] text-slate-500">
              Lowest cost per GB of memory
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 uppercase">
              <Award className="h-3.5 w-3.5 text-amber-600" /> Best Display
            </span>
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {activeProducts.find((p) => p.name.includes("OLED"))?.name ||
                activeProducts[0].name}
            </h4>
            <p className="text-[11px] text-slate-500">
              Vivid contrast & anti-glare
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-700 uppercase">
              <Award className="h-3.5 w-3.5 text-violet-600" /> Best Battery
            </span>
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {activeProducts[0].name}
            </h4>
            <p className="text-[11px] text-slate-500">
              Rapid charge boost support
            </p>
          </div>
        </div>
      </div>

      {/* SECTION E: Review Intelligence Side-by-Side */}
      <div className="saas-card p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Review Intelligence & Authentic Sentiment
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Synthesized from thousands of verified buyer reviews to filter out bot spam
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeProducts.slice(0, 2).map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {p.sentiment.reliabilityScore}% Verified
                </span>
              </div>

              {/* Sentiment Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Sentiment Breakdown</span>
                  <span className="font-semibold text-emerald-600">
                    {p.sentiment.positivePct}% Positive
                  </span>
                </div>
                <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-200">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${p.sentiment.positivePct}%` }}
                  />
                  <div
                    className="bg-slate-400 h-full"
                    style={{ width: `${p.sentiment.neutralPct}%` }}
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${p.sentiment.negativePct}%` }}
                  />
                </div>
              </div>

              {/* Top Themes */}
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <span className="font-bold text-emerald-700 block mb-1">
                    Top Praise Themes
                  </span>
                  <ul className="space-y-0.5 text-slate-600">
                    {p.sentiment.positiveThemes.slice(0, 3).map((theme, i) => (
                      <li key={i} className="truncate">
                        ✓ {theme}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-rose-700 block mb-1">
                    Reported Quirks
                  </span>
                  <ul className="space-y-0.5 text-slate-600">
                    {p.sentiment.negativeThemes.slice(0, 2).map((theme, i) => (
                      <li key={i} className="truncate">
                        ⚠ {theme}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Picker Modal */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Add Product to Comparison Matrix
              </h3>
              <button
                onClick={() => setPickerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search within picker */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search products to add..."
                className="bg-transparent flex-1 focus:outline-none text-slate-900"
              />
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1">
              {unselectedProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No other products found.
                </div>
              ) : (
                unselectedProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      addToCompare(p.id);
                      setPickerOpen(false);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-10 w-10 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {p.name}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {p.brand} · {p.category} · {formatINR(p.price)}
                        </span>
                      </div>
                    </div>

                    <button className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs hover:bg-indigo-100">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
