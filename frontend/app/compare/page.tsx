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
  BatteryCharging,
  Cpu,
  Layers,
  Award,
} from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";
import { SMARTCART_PRODUCTS, SmartCartProduct } from "@/lib/smartcartData";

export default function ComparePage() {
  const {
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    addToCart,
    setQuickViewProduct,
  } = useNovatek();

  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Default comparison: iPhone 16 Pro vs Samsung Galaxy S24
  const activeProducts =
    compareList.length > 0
      ? compareList
      : [SMARTCART_PRODUCTS[0], SMARTCART_PRODUCTS[1]];

  // Spec Rows definition
  interface SpecDefinition {
    id: string;
    label: string;
    category: "Overview" | "Silicon & Performance" | "Battery & Charging" | "Chassis & Build" | "Camera & Optics";
    getValue: (p: SmartCartProduct) => string | number | undefined;
  }

  const specRows: SpecDefinition[] = [
    // Overview
    { id: "brand", label: "Manufacturer Brand", category: "Overview", getValue: (p) => p.brand },
    { id: "category", label: "Category", category: "Overview", getValue: (p) => p.category },
    { id: "price", label: "Price", category: "Overview", getValue: (p) => `$${p.price}.00` },
    { id: "rating", label: "Customer Rating", category: "Overview", getValue: (p) => `${p.rating} / 5.0 (${p.reviewCount} reviews)` },
    { id: "trust", label: "Verified Buyer Trust Score", category: "Overview", getValue: (p) => `${p.trustScore}% Verified` },
    
    // Silicon & Performance
    { id: "processor", label: "Processor & Architecture", category: "Silicon & Performance", getValue: (p) => p.specs.processor || "Flagship Core" },
    { id: "display", label: "Display Size & Resolution", category: "Silicon & Performance", getValue: (p) => p.specs.display || "OLED High Refresh" },
    { id: "storage", label: "Storage & Memory", category: "Silicon & Performance", getValue: (p) => p.specs.storage || p.storageOption || "256GB" },
    
    // Battery & Charging
    { id: "battery", label: "Battery Playback / Capacity", category: "Battery & Charging", getValue: (p) => p.specs.battery || "All-Day Endurance" },
    { id: "charging", label: "Fast Charging Speed", category: "Battery & Charging", getValue: (p) => p.specs.charging || "Fast Charge Supported" },
    
    // Chassis & Build
    { id: "build", label: "Chassis Material & Frame", category: "Chassis & Build", getValue: (p) => p.specs.build || "Aerospace Grade" },
    { id: "weight", label: "Weight", category: "Chassis & Build", getValue: (p) => p.specs.weight || "Lightweight" },
    { id: "waterResistance", label: "Water & Ingress Rating", category: "Chassis & Build", getValue: (p) => p.specs.waterResistance || "IP68 Water Resistant" },
    
    // Camera & Optics
    { id: "camera", label: "Camera System", category: "Camera & Optics", getValue: (p) => p.specs.camera || "Pro Multi-Lens Array" },
    { id: "connectivity", label: "5G & Connectivity", category: "Camera & Optics", getValue: (p) => p.specs.connectivity || "5G · Wi-Fi 7" },
    { id: "warranty", label: "SmartCart Care Warranty", category: "Camera & Optics", getValue: (p) => p.specs.warranty || "SmartCart 1-Year Protection" },
  ];

  const rowDiffers = (spec: SpecDefinition) => {
    const values = activeProducts.map((p) => String(spec.getValue(p) ?? ""));
    return new Set(values).size > 1;
  };

  const categories = [
    "Overview",
    "Silicon & Performance",
    "Battery & Charging",
    "Chassis & Build",
    "Camera & Optics",
  ] as const;

  const unselectedProducts = SMARTCART_PRODUCTS.filter(
    (p) => !activeProducts.some((ap) => ap.id === p.id)
  );

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>SmartCart Device Comparison</span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Device Comparison Studio
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              Compare processor benchmarks, battery playback, titanium builds, and verified review trust scores across up to 4 devices simultaneously.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {activeProducts.length < 4 && (
              <button
                onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add Device ({activeProducts.length}/4)</span>
              </button>
            )}

            {activeProducts.length > 0 && (
              <button
                onClick={clearCompare}
                className="rounded-xl border border-slate-800 bg-[#0d1224] px-3.5 py-2.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Controls Bar: Toggle Highlights */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-[#0d1222] p-4 text-xs">
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
              />
              <span className="font-semibold text-white">Highlight Differences</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={onlyDifferences}
                onChange={(e) => setOnlyDifferences(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
              />
              <span className="font-semibold text-slate-300">Only Show Differences</span>
            </label>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>AI Automated Spec Scoring Active</span>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-800 bg-[#0b0f1e] shadow-2xl">
          <div className="min-w-[800px]">
            
            {/* Sticky Product Cards Header Row */}
            <div className="grid grid-cols-12 border-b border-slate-800 bg-[#090d1a] p-6 gap-4">
              <div className="col-span-3 flex flex-col justify-end">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Devices ({activeProducts.length})
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Select &quot;Add Device&quot; to include other models from the catalog.
                </p>
              </div>

              {/* Product Column Headers */}
              {activeProducts.map((product) => {
                const colSpan = Math.floor(9 / activeProducts.length);
                return (
                  <div
                    key={product.id}
                    className={`col-span-${colSpan} flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#0e162c] p-4 relative group`}
                    style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      title="Remove from comparison"
                      className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* Image */}
                    <div
                      onClick={() => setQuickViewProduct(product)}
                      className="cursor-pointer aspect-square w-full max-w-[140px] mx-auto flex items-center justify-center rounded-xl bg-[#07090e] p-2 mb-3 border border-slate-800"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain filter contrast-105"
                      />
                    </div>

                    {/* Details */}
                    <div>
                      {product.badge && (
                        <span className="rounded-full bg-blue-600/30 border border-blue-500/40 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                          {product.badge}
                        </span>
                      )}
                      <h3
                        onClick={() => setQuickViewProduct(product)}
                        className="mt-1 text-sm font-bold text-white hover:text-cyan-300 cursor-pointer line-clamp-1"
                      >
                        {product.name}
                      </h3>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-base font-black text-white">
                          ${product.price}.00
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-slate-500 line-through">
                            ${product.originalPrice}.00
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Add to Cart */}
                    <button
                      onClick={() => addToCart(product)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all hover:scale-105"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                );
              })}

              {/* Empty Slot Placeholder if < 4 */}
              {activeProducts.length < 4 && (
                <div
                  onClick={() => setPickerOpen(true)}
                  className="col-span-2 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-800/80 bg-[#090c17]/40 p-6 text-center cursor-pointer hover:border-cyan-500/40 hover:bg-slate-900/40 transition-all"
                  style={{ gridColumn: `span ${Math.floor(9 / activeProducts.length)} / span ${Math.floor(9 / activeProducts.length)}` }}
                >
                  <Plus className="h-8 w-8 text-slate-600 mb-2" />
                  <span className="text-xs font-bold text-slate-400">Add Device</span>
                  <span className="text-[10px] text-slate-600 mt-0.5">Click to choose</span>
                </div>
              )}
            </div>

            {/* Spec Sections */}
            {categories.map((catName) => {
              const rowsInCategory = specRows.filter((r) => r.category === catName);

              return (
                <div key={catName} className="border-b border-slate-800/80">
                  {/* Category Section Header */}
                  <div className="bg-[#080b16] px-6 py-3 text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5" />
                    <span>{catName}</span>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-slate-800/40">
                    {rowsInCategory.map((spec) => {
                      const differs = rowDiffers(spec);

                      if (onlyDifferences && !differs) {
                        return null;
                      }

                      return (
                        <div
                          key={spec.id}
                          className={`grid grid-cols-12 px-6 py-4 items-center transition-colors ${
                            highlightDifferences && differs
                              ? "bg-cyan-950/15"
                              : "hover:bg-slate-900/30"
                          }`}
                        >
                          {/* Spec Name */}
                          <div className="col-span-3 text-xs font-medium text-slate-300">
                            {spec.label}
                            {highlightDifferences && differs && (
                              <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-cyan-400" />
                            )}
                          </div>

                          {/* Values per Product */}
                          {activeProducts.map((product) => {
                            const val = spec.getValue(product);
                            const colSpan = Math.floor(9 / activeProducts.length);

                            return (
                              <div
                                key={product.id}
                                className="text-xs text-white pr-4 font-normal"
                                style={{
                                  gridColumn: `span ${colSpan} / span ${colSpan}`,
                                }}
                              >
                                {val !== undefined && val !== null ? (
                                  <span className={spec.id === "price" ? "font-bold text-cyan-300" : ""}>
                                    {String(val)}
                                  </span>
                                ) : (
                                  <span className="text-slate-600">—</span>
                                )}
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

        {/* AI Spec Summary & Recommendation Box */}
        <div className="mt-12 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-[#0d1222] p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                SMARTCART AI VERDICT
              </span>
              <h2 className="text-xl font-bold text-white">
                Decision & Spec Comparison Matrix
              </h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {activeProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-slate-800 bg-[#090e1f] p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{product.name}</h3>
                  <span className="text-xs font-bold text-cyan-300">${product.price}.00</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {product.description}
                </p>
                <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Best for:</span>
                  <span className="font-semibold text-cyan-300">{product.tagline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Picker Modal */}
        {pickerOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in"
            onClick={() => setPickerOpen(false)}
          >
            <div
              className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-[#0c1224] p-6 shadow-2xl animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white">Select Device to Compare</h3>
              <p className="text-xs text-slate-400 mt-1">
                Choose a smartphone from our verified catalog to add to the comparison matrix.
              </p>

              <div className="mt-4 max-h-96 overflow-y-auto space-y-2 pr-1">
                {unselectedProducts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    All available products are currently in the comparison table.
                  </p>
                ) : (
                  unselectedProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        addToCompare(p);
                        setPickerOpen(false);
                      }}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-[#080c18] p-3 transition-colors hover:border-cyan-400/50 hover:bg-slate-900"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#060810] p-1 border border-slate-800">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{p.name}</h4>
                          <span className="text-[10px] text-slate-400">{p.brand} · ${p.price}.00</span>
                        </div>
                      </div>

                      <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setPickerOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
