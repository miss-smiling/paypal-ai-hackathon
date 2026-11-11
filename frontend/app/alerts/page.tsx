"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  Trash2,
  Plus,
  ArrowRight,
  TrendingDown,
  Clock,
  ExternalLink,
  X,
  Info,
} from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";
import { alertService, productService } from "@/lib/services";
import { PriceAlert, Product } from "@/lib/types";
import { formatINR } from "@/lib/mockData";

export default function PriceAlertsPage() {
  const { addToast, refreshCounts } = useSmartCart();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "triggered" | "history">("active");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [targetPriceInput, setTargetPriceInput] = useState<number | "">("");

  useEffect(() => {
    setAlerts(alertService.get());
    const all = productService.getAll();
    if (all.length > 0) setSelectedProductId(all[0].id);
  }, []);

  const activeAlerts = alerts.filter((a) => a.status === "active" || a.status === "paused");
  const triggeredAlerts = alerts.filter((a) => a.status === "triggered");

  const handleTogglePause = (id: string) => {
    const status = alertService.togglePause(id);
    setAlerts(alertService.get());
    refreshCounts();
    addToast(
      status === "paused" ? "Alert Paused" : "Alert Resumed",
      status === "paused" ? "Price tracking paused." : "Actively monitoring price drops.",
      "info"
    );
  };

  const handleDelete = (id: string) => {
    alertService.delete(id);
    setAlerts(alertService.get());
    refreshCounts();
    addToast("Alert Removed", "Price monitor deleted.", "info");
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !targetPriceInput || targetPriceInput <= 0) return;

    alertService.create(selectedProductId, Number(targetPriceInput));
    setAlerts(alertService.get());
    refreshCounts();
    setIsCreateOpen(false);
    setTargetPriceInput("");
    addToast("Price Alert Created", "CART is tracking real-time price drops.", "success");
  };

  const allProducts = productService.getAll();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 uppercase tracking-wider mb-1">
            <Bell className="h-3.5 w-3.5 text-violet-600" />
            <span>Price Intelligence & Drop Alerts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Price Alerts & Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Set custom price drop triggers. CART periodically checks verified Amazon and Flipkart listings and alerts you the instant items enter your budget target.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 self-start sm:self-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Alert</span>
        </button>
      </div>

      {/* Realistic System Architecture Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
        <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Illustrative Telemetry Notice:</strong> Real-time asynchronous web crawling requires a connected background worker service. Prices displayed in this demo reflect illustrative snapshot prices and simulated threshold triggers.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === "active"
              ? "text-indigo-600"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Active Monitors ({activeAlerts.length})
          {activeTab === "active" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("triggered")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === "triggered"
              ? "text-indigo-600"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Triggered Drops ({triggeredAlerts.length})
          {activeTab === "triggered" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === "history"
              ? "text-indigo-600"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Alert Activity History
          {activeTab === "history" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab 1: Active Alerts */}
      {activeTab === "active" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeAlerts.length === 0 ? (
            <div className="col-span-full saas-card py-12 text-center text-xs text-slate-500">
              No active price alerts currently running. Click &quot;Create New Alert&quot; to set one up.
            </div>
          ) : (
            activeAlerts.map((alert) => {
              const diff = alert.currentPrice - alert.targetPrice;
              const pctToTarget = Math.max(
                0,
                Math.min(100, Math.round((alert.targetPrice / alert.currentPrice) * 100))
              );

              return (
                <div
                  key={alert.id}
                  className="saas-card saas-card-hover p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Header: Retailer + Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {alert.retailer}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          alert.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {alert.status === "active" ? "● Monitoring" : "❚❚ Paused"}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="flex items-center gap-3 mt-3">
                      <img
                        src={alert.product.image}
                        alt={alert.product.name}
                        className="h-12 w-12 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/product/${alert.product.id}`}
                          className="font-bold text-xs sm:text-sm text-slate-900 hover:text-indigo-600 line-clamp-1 transition-colors"
                        >
                          {alert.product.name}
                        </Link>
                        <p className="text-[11px] text-slate-400">
                          Created {alert.createdAt}
                        </p>
                      </div>
                    </div>

                    {/* Price Comparison */}
                    <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-semibold">
                          Current Price
                        </span>
                        <div className="font-bold text-slate-900 mt-0.5">
                          {formatINR(alert.currentPrice)}
                        </div>
                      </div>
                      <div>
                        <span className="text-indigo-600 text-[10px] uppercase font-bold">
                          Target Drop
                        </span>
                        <div className="font-black text-indigo-700 mt-0.5">
                          {formatINR(alert.targetPrice)}
                        </div>
                      </div>
                    </div>

                    {/* Proximity Progress Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Proximity to target:</span>
                        <span className="font-semibold text-indigo-600">
                          {diff > 0 ? `${formatINR(diff)} away` : "Reached!"}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-600"
                          style={{ width: `${pctToTarget}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleTogglePause(alert.id)}
                      className="text-slate-600 hover:text-indigo-600 font-semibold flex items-center gap-1.5"
                    >
                      {alert.status === "active" ? (
                        <>
                          <Pause className="h-3.5 w-3.5" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5" />
                          <span>Resume</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Triggered Drops */}
      {activeTab === "triggered" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {triggeredAlerts.length === 0 ? (
            <div className="col-span-full saas-card py-12 text-center text-xs text-slate-500">
              No triggered price alerts yet.
            </div>
          ) : (
            triggeredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="saas-card p-5 border-l-4 border-l-emerald-500 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Target Reached on {alert.triggeredAt || "Nov 08, 2026"}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {alert.retailer}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <img
                      src={alert.product.image}
                      alt={alert.product.name}
                      className="h-12 w-12 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {alert.product.name}
                      </h4>
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                        Dropped to {formatINR(alert.currentPrice)} (Target was{" "}
                        {formatINR(alert.targetPrice)})
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 line-through">
                    Was {formatINR(alert.initialPrice)}
                  </span>
                  <Link
                    href={`/product/${alert.product.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                  >
                    <span>View Deal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === "history" && (
        <div className="saas-card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            <span>Alert Timeline & Event Log</span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex items-start gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">
                  Target Price Drop Hit: Apple iPhone 15 dropped to ₹64,999
                </p>
                <p className="text-slate-500">
                  Flipkart Big Diwali Sale price match triggered instant push notification.
                </p>
                <span className="text-[10px] text-slate-400">Nov 08, 2026 · 11:45 AM</span>
              </div>
            </div>

            <div className="py-3 flex items-start gap-3">
              <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">
                  Target Price Drop Hit: Samsung Galaxy Watch 6 reached ₹19,999
                </p>
                <p className="text-slate-500">
                  Retailer discount of 39% crossed your ₹19,999 threshold.
                </p>
                <span className="text-[10px] text-slate-400">Nov 09, 2026 · 2:10 PM</span>
              </div>
            </div>

            <div className="py-3 flex items-start gap-3">
              <span className="h-2 w-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">
                  Created Price Alert for Lenovo IdeaPad Slim 3
                </p>
                <p className="text-slate-500">
                  Target threshold established at ₹52,000.
                </p>
                <span className="text-[10px] text-slate-400">Nov 02, 2026 · 10:15 AM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Alert Modal */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Create New Price Alert
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Product to Monitor
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 bg-white"
                >
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatINR(p.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Price (INR ₹)
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  value={targetPriceInput}
                  onChange={(e) =>
                    setTargetPriceInput(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="e.g. 52000"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  You will be notified when this item drops below this amount.
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Start Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
