"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  GitCompare,
  Eye,
  ShoppingBag,
  Heart,
  Bot,
  Wallet,
  Bell,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Calendar,
} from "lucide-react";
import { historyService } from "@/lib/services";
import { ShoppingHistoryEvent } from "@/lib/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<ShoppingHistoryEvent[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setHistory(historyService.get());
  }, []);

  const filtered = history.filter((item) => {
    const matchType = filterType === "all" || item.type === filterType;
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "comparison":
        return <GitCompare className="h-4 w-4 text-indigo-600" />;
      case "view":
        return <Eye className="h-4 w-4 text-cyan-600" />;
      case "purchase":
        return <ShoppingBag className="h-4 w-4 text-emerald-600" />;
      case "watchlist":
        return <Heart className="h-4 w-4 text-rose-600" />;
      case "chat":
        return <Bot className="h-4 w-4 text-violet-600" />;
      case "budget":
        return <Wallet className="h-4 w-4 text-amber-600" />;
      case "alert":
        return <Bell className="h-4 w-4 text-rose-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
          <Clock className="h-3.5 w-3.5 text-indigo-600" />
          <span>Shopping Activity & Audit Trail</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Shopping History & Intelligence Log
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Review previous product comparisons, viewed items, recorded purchases, and previous CART AI shopping consultations.
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saas-card p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Total Comparisons
          </span>
          <div className="text-2xl font-black text-slate-900">24 Sessions</div>
          <p className="text-[11px] text-slate-400">Spec matrices generated</p>
        </div>

        <div className="saas-card p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Products Viewed
          </span>
          <div className="text-2xl font-black text-slate-900">67 Items</div>
          <p className="text-[11px] text-slate-400">Across Amazon & Flipkart</p>
        </div>

        <div className="saas-card p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Purchases Logged
          </span>
          <div className="text-2xl font-black text-emerald-600">5 Orders</div>
          <p className="text-[11px] text-slate-400">Recorded against budget</p>
        </div>

        <div className="saas-card p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            AI Consultations
          </span>
          <div className="text-2xl font-black text-violet-600">18 Queries</div>
          <p className="text-[11px] text-slate-400">CART intelligence interactions</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity by product, query or description..."
            className="w-full bg-transparent text-slate-900 focus:outline-none placeholder-slate-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Activity" },
            { id: "comparison", label: "Comparisons" },
            { id: "view", label: "Views" },
            { id: "chat", label: "AI Consultations" },
            { id: "watchlist", label: "Watchlist" },
            { id: "purchase", label: "Purchases" },
            { id: "alert", label: "Alerts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors shrink-0 ${
                filterType === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="saas-card p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            Timeline Feed ({filtered.length} Events)
          </h3>
          <span className="text-xs text-slate-400">Sorted by most recent</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No shopping events matched your filters.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filtered.map((item) => (
              <div key={item.id} className="relative group">
                {/* Dot */}
                <div className="absolute -left-6 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white border-2 border-indigo-500 shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white group-hover:border-indigo-200 group-hover:shadow-2xs transition-all space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-100">
                        {getIcon(item.type)}
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        {item.title}
                      </h4>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                    {item.description}
                  </p>

                  {item.link && (
                    <div className="pl-8 pt-1">
                      <Link
                        href={item.link}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
