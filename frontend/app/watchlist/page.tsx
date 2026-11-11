"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  TrendingDown,
  TrendingUp,
  Minus,
  Bell,
  Trash2,
  GitCompare,
  ArrowRight,
  Plus,
  SlidersHorizontal,
  Star,
  ExternalLink,
  Search,
  Filter,
  X,
  Check,
} from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";
import { watchlistService, productService } from "@/lib/services";
import { WatchlistItem, Product, Retailer, ProductCategory } from "@/lib/types";
import { formatINR } from "@/lib/mockData";

export default function WatchlistPage() {
  const { addToCompare, isComparing, refreshCounts, addToast } = useSmartCart();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRetailer, setSelectedRetailer] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"recent" | "price-asc" | "price-desc">("recent");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editTargetValue, setEditTargetValue] = useState<number>(0);

  useEffect(() => {
    setItems(watchlistService.get());
  }, []);

  const handleRemove = (id: string, name: string) => {
    watchlistService.remove(id);
    const updated = watchlistService.get();
    setItems(updated);
    refreshCounts();
    addToast("Removed from Watchlist", `${name} untracked.`, "info");
  };

  const handleToggleAlert = (id: string) => {
    const newState = watchlistService.toggleAlert(id);
    const updated = watchlistService.get();
    setItems(updated);
    refreshCounts();
    addToast(
      newState ? "Price Alert Enabled" : "Price Alert Paused",
      "We will notify you when price hits target.",
      "info"
    );
  };

  const handleSaveTarget = (id: string) => {
    if (editTargetValue > 0) {
      watchlistService.updateTargetPrice(id, editTargetValue);
      setItems(watchlistService.get());
      setEditingItemId(null);
      addToast("Target Updated", `Price alert threshold set to ${formatINR(editTargetValue)}`, "success");
    }
  };

  // Filter & Sort
  const filteredItems = items
    .filter((item) => {
      const matchSearch =
        item.product.name.toLowerCase().includes(search.toLowerCase()) ||
        item.product.brand.toLowerCase().includes(search.toLowerCase());
      const matchRetailer =
        selectedRetailer === "All" || item.product.retailer === selectedRetailer;
      const matchCategory =
        selectedCategory === "All" || item.product.category === selectedCategory;
      return matchSearch && matchRetailer && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.product.price - b.product.price;
      if (sortBy === "price-desc") return b.product.price - a.product.price;
      return 0; // recent
    });

  const allProducts = productService.getAll();
  const unwatchlistedProducts = allProducts.filter(
    (p) => !items.some((w) => w.productId === p.id)
  );

  const handleAddProduct = (product: Product) => {
    watchlistService.add(product);
    setItems(watchlistService.get());
    refreshCounts();
    setIsAddModalOpen(false);
    addToast("Added to Watchlist", `${product.name} is now tracked.`, "success");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">
            <Heart className="h-3.5 w-3.5 text-rose-600 fill-rose-100" />
            <span>Product Tracking Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Shopping Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Save products you are interested in purchasing, set custom target price alerts, and monitor multi-retailer price movements.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 self-start sm:self-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Track New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracked products..."
            className="w-full bg-transparent text-slate-900 focus:outline-none placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Retailer Filter */}
          <select
            value={selectedRetailer}
            onChange={(e) => setSelectedRetailer(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Retailers</option>
            <option value="Amazon">Amazon</option>
            <option value="Flipkart">Flipkart</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Categories</option>
            <option value="Laptops">Laptops</option>
            <option value="Smartphones">Smartphones</option>
            <option value="Audio">Audio</option>
            <option value="Wearables">Wearables</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="recent">Recently Added</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Watchlist Grid */}
      {filteredItems.length === 0 ? (
        <div className="saas-card py-16 px-6 text-center space-y-4">
          <div className="inline-flex p-4 rounded-3xl bg-rose-50 text-rose-500">
            <Heart className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Your Watchlist is Empty
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            You are not tracking any products yet. Browse our verified recommendations or search for products to monitor price drops.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Browse Products to Track</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const p = item.product;
            const isEditing = editingItemId === item.id;
            const diff = p.originalPrice - p.price;

            return (
              <div
                key={item.id}
                className="saas-card saas-card-hover p-5 flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top Bar: Retailer + Remove */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {p.retailer}
                    </span>

                    <button
                      onClick={() => handleRemove(item.id, p.name)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Image */}
                  <div className="aspect-video w-full rounded-xl bg-slate-100 overflow-hidden mb-3 border border-slate-100 relative">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Price movement pill */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 backdrop-blur-xs shadow-2xs flex items-center gap-1">
                      {item.priceMovement === "down" ? (
                        <>
                          <TrendingDown className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-700">
                            ↓ {formatINR(item.priceDiff)} lower
                          </span>
                        </>
                      ) : (
                        <>
                          <Minus className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-600">Stable</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Brand & Name */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <span className="font-bold text-indigo-600">{p.brand}</span>
                    <span>·</span>
                    <span>{p.category}</span>
                  </div>

                  <Link
                    href={`/product/${p.id}`}
                    className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 line-clamp-2 transition-colors"
                  >
                    {p.name}
                  </Link>

                  {/* Pricing info */}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xl font-black text-slate-900">
                      {formatINR(p.price)}
                    </span>
                    {p.originalPrice > p.price && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatINR(p.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Target Price & Alert Toggle */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Target Price:</span>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editTargetValue}
                            onChange={(e) => setEditTargetValue(Number(e.target.value))}
                            className="w-24 rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-900"
                          />
                          <button
                            onClick={() => handleSaveTarget(item.id)}
                            className="p-1 rounded bg-indigo-600 text-white"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingItemId(item.id);
                            setEditTargetValue(item.targetPrice);
                          }}
                          className="font-bold text-indigo-600 hover:underline"
                        >
                          {formatINR(item.targetPrice)}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-500">Price Drop Alert:</span>
                      <button
                        onClick={() => handleToggleAlert(item.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                          item.priceAlertEnabled
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {item.priceAlertEnabled ? "Active" : "Paused"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom action buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
                  <button
                    onClick={() => addToCompare(p.id)}
                    className={`flex-1 py-2 rounded-xl font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      isComparing(p.id)
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <GitCompare className="h-3.5 w-3.5" />
                    <span>{isComparing(p.id) ? "Comparing" : "Compare"}</span>
                  </button>

                  <Link
                    href={`/product/${p.id}`}
                    className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                    title="View Full Product Intelligence"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Track a Product to Watchlist
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1">
              {unwatchlistedProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  All catalog products are already tracked in your watchlist!
                </div>
              ) : (
                unwatchlistedProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleAddProduct(p)}
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
                          {p.retailer} · {formatINR(p.price)}
                        </span>
                      </div>
                    </div>

                    <button className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
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
