"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  GitCompare,
  Wallet,
  Heart,
  Bell,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Star,
  ShieldCheck,
  Plus,
  SlidersHorizontal,
  Bot,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";
import { productService, budgetService, watchlistService, alertService, historyService, catalogService } from "@/lib/services";
import { Product, BudgetPlan, ShoppingHistoryEvent } from "@/lib/types";
import { formatINR } from "@/lib/mockData";
import PayPalLogo from "@/components/ui/PayPalLogo";

export default function DashboardPage() {
  const { user, addToCompare, isComparing, addToast } = useSmartCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [budget, setBudget] = useState<BudgetPlan>(budgetService.get());
  const [history, setHistory] = useState<ShoppingHistoryEvent[]>([]);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    setProducts(productService.getAll()); // instant render from mock cache
    // Swap in the backend catalog (mock fallback) once hydrated.
    catalogService.hydrate().then(() => {
      setProducts(productService.getAll());
    });
    setBudget(budgetService.get());
    setHistory(historyService.get());

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const laptopRecs = products.filter((p) => p.category === "Laptops").slice(0, 3);
  const trendingDeals = products.filter((p) => p.discountPct >= 16);

  const budgetRemaining = Math.max(0, budget.totalBudget - budget.amountSpent);
  const budgetSpentPct = Math.min(100, Math.round((budget.amountSpent / budget.totalBudget) * 100));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* SECTION A: Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-6 sm:p-10 text-white shadow-xl shadow-indigo-950/10">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 h-48 w-48 rounded-full bg-violet-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-indigo-200 border border-white/10">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300 animate-pulse" />
            <span>Autonomous Shopping Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {greeting}, {user.name.split(" ")[0]}
          </h1>

          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed max-w-2xl">
            Your smarter way to shop starts here. SmartCart tracks specifications,
            evaluates genuine buyer sentiment across Amazon and Flipkart, and saves you an extra 10% on total cost when paying with PayPal.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs sm:text-sm font-bold text-indigo-900 shadow-md hover:bg-indigo-50 transition-all hover:scale-[1.02]"
            >
              <Bot className="h-4 w-4 text-indigo-600" />
              <span>Ask CART</span>
            </Link>

            <Link
              href="/compare"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-800/60 hover:bg-indigo-800/80 border border-indigo-400/30 px-5 py-3 text-xs sm:text-sm font-semibold text-white transition-all hover:scale-[1.02]"
            >
              <GitCompare className="h-4 w-4 text-indigo-200" />
              <span>Compare Products</span>
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION B: Shopping Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Budget */}
        <div className="saas-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Budget
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {formatINR(budget.totalBudget)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Q4 Shopping Plan</p>
          </div>
        </div>

        {/* Amount Spent */}
        <div className="saas-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Amount Spent
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {formatINR(budget.amountSpent)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {budgetSpentPct}% of total budget
            </p>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="saas-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Remaining
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-emerald-600">
              {formatINR(budgetRemaining)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Available balance</p>
          </div>
        </div>

        {/* Tracked Products */}
        <div className="saas-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tracked Items
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {watchlistService.get().length} Products
            </div>
            <Link
              href="/watchlist"
              className="text-[11px] text-indigo-600 hover:underline font-semibold mt-0.5 inline-block"
            >
              View Watchlist →
            </Link>
          </div>
        </div>

        {/* Active Price Alerts */}
        <div className="col-span-2 lg:col-span-1 saas-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Alerts
            </span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <Bell className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {alertService.get().filter((a) => a.status === "active").length} Active
            </div>
            <Link
              href="/alerts"
              className="text-[11px] text-indigo-600 hover:underline font-semibold mt-0.5 inline-block"
            >
              Monitor Drops →
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION C: Budget Utilisation & Breakdown */}
      <div className="saas-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-indigo-600" />
              <span>Budget Utilisation & Category Breakdown</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Target plan: {budget.name} · Closes on {budget.deadline}
            </p>
          </div>

          <Link
            href="/budget"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <span>Manage Budget & Expenses</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">
              Spent {formatINR(budget.amountSpent)} of {formatINR(budget.totalBudget)}
            </span>
            <span className="text-indigo-600">{budgetSpentPct}% Utilised</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-700"
              style={{ width: `${budgetSpentPct}%` }}
            />
          </div>
        </div>

        {/* Category breakdown cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {budget.categories.map((cat) => {
            const catSpentPct =
              cat.allocated > 0 ? Math.round((cat.spent / cat.allocated) * 100) : 0;
            return (
              <div
                key={cat.category}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{cat.category}</span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {catSpentPct}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, catSpentPct)}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Spent {formatINR(cat.spent)}</span>
                  <span>Cap {formatINR(cat.allocated)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION D: CART AI Recommendations */}
      <div className="rounded-3xl border border-indigo-200 bg-gradient-to-b from-indigo-50/40 via-white to-white p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>CART Intelligence Recommendation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Your laptop budget is ₹70,000. We found 3 options worth comparing.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Filtered for programming workloads, 16GB RAM minimum, and verified thermal performance.
            </p>
          </div>

          <Link
            href="/assistant"
            className="inline-flex items-center gap-2 self-start rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <span>Ask CART to Refine</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3 Laptop Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {laptopRecs.map((laptop) => (
            <div
              key={laptop.id}
              className="saas-card saas-card-hover p-5 flex flex-col justify-between group"
            >
              <div>
                {/* Image & Retailer Badge */}
                <div className="relative aspect-video w-full rounded-xl bg-slate-100 overflow-hidden mb-4 border border-slate-100">
                  <img
                    src={laptop.image}
                    alt={laptop.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
                    {laptop.retailer}
                  </span>
                  {laptop.isBestSeller && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-xs">
                      Best Value
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-indigo-600">
                    {laptop.brand}
                  </span>
                  <span className="text-xs text-slate-300">·</span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{laptop.rating}</span>
                    <span className="text-slate-400 font-normal">
                      ({laptop.reviewCount.toLocaleString()})
                    </span>
                  </div>
                </div>

                <Link
                  href={`/product/${laptop.id}`}
                  className="font-bold text-slate-900 group-hover:text-indigo-600 text-sm line-clamp-2 transition-colors"
                >
                  {laptop.name}
                </Link>

                {/* AI Note */}
                <div className="mt-3 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
                  <span className="font-bold">CART verdict:</span> {laptop.aiSummary}
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-slate-900">
                      {formatINR(laptop.price)}
                    </span>
                    <span className="text-[11px] text-slate-400 line-through">
                      {formatINR(laptop.originalPrice)}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <PayPalLogo variant="monogram" className="h-2.5" />
                    <span>{formatINR(Math.round(laptop.price * 0.9))} with 10% OFF</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addToCompare(laptop.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isComparing(laptop.id)
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {isComparing(laptop.id) ? "Comparing" : "Compare"}
                  </button>
                  <Link
                    href={`/product/${laptop.id}`}
                    className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                    title="View details"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION E: Trending Deals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Trending Deals Across Categories
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified price drops on Amazon and Flipkart with authentic reviews
            </p>
          </div>

          <Link
            href="/watchlist"
            className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <span>View Watchlist</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingDeals.map((product) => (
            <div
              key={product.id}
              className="saas-card saas-card-hover p-4 flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-square w-full rounded-xl bg-slate-100 overflow-hidden mb-3 border border-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                    {product.discountPct}% OFF
                  </span>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/90 backdrop-blur-xs text-slate-700 shadow-2xs">
                    {product.retailer}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <span>{product.brand}</span>
                  <span>·</span>
                  <span>{product.category}</span>
                </div>

                <Link
                  href={`/product/${product.id}`}
                  className="font-bold text-slate-900 group-hover:text-indigo-600 text-xs sm:text-sm line-clamp-2 transition-colors"
                >
                  {product.name}
                </Link>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-base font-black text-slate-900">
                    {formatINR(product.price)}
                  </div>
                  <span className="text-[11px] text-slate-400 line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                </div>

                <Link
                  href={`/product/${product.id}`}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold transition-colors"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION F & G: Two-column Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION F: Recent Activity (2 cols) */}
        <div className="lg:col-span-2 saas-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>Recent Activity & Insights</span>
            </h3>
            <Link
              href="/history"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Full History →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {history.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{item.title}</h4>
                    <p className="text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 shrink-0">
                  {item.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION G: Quick Actions (1 col) */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Quick Actions
          </h3>

          <div className="space-y-2.5">
            <Link
              href="/compare"
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all group"
            >
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <GitCompare className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-900 block">
                  Start a Comparison
                </span>
                <span className="text-[11px] text-slate-400">
                  Evaluate side-by-side specs
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </Link>

            <Link
              href="/assistant"
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all group"
            >
              <div className="p-2 rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-900 block">
                  Ask CART Assistant
                </span>
                <span className="text-[11px] text-slate-400">
                  Natural language shopping queries
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-violet-600 transition-colors" />
            </Link>

            <Link
              href="/budget"
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all group"
            >
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Wallet className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-900 block">
                  Budget Planner
                </span>
                <span className="text-[11px] text-slate-400">
                  Manage caps & log expenses
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
            </Link>

            <Link
              href="/watchlist"
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all group"
            >
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Heart className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-900 block">
                  View Watchlist
                </span>
                <span className="text-[11px] text-slate-400">
                  Track price movements
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-rose-600 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
