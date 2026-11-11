"use client";

import { useState } from "react";
import {
  User,
  ShoppingBag,
  Bell,
  Sliders,
  Shield,
  Save,
  CheckCircle2,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";
import { ProductCategory, Retailer } from "@/lib/types";

export default function SettingsPage() {
  const { user, updateUser, addToast } = useSmartCart();

  // Local state initialized with user profile
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [defaultBudget, setDefaultBudget] = useState(user.defaultBudget);
  const [retailers, setRetailers] = useState<Retailer[]>(user.preferredRetailers);
  const [categories, setCategories] = useState<ProductCategory[]>(user.preferredCategories);
  const [notifications, setNotifications] = useState(user.notifications);
  const [currency, setCurrency] = useState(user.display.currency);
  const [layout, setLayout] = useState(user.display.layout);

  const availableRetailers: Retailer[] = ["Amazon", "Flipkart", "Croma", "Reliance Digital"];
  const availableCategories: ProductCategory[] = [
    "Laptops",
    "Smartphones",
    "Audio",
    "Wearables",
    "Accessories",
    "Home Appliances",
  ];

  const handleToggleRetailer = (ret: Retailer) => {
    setRetailers((prev) =>
      prev.includes(ret) ? prev.filter((r) => r !== ret) : [...prev, ret]
    );
  };

  const handleToggleCategory = (cat: ProductCategory) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      defaultBudget,
      preferredRetailers: retailers,
      preferredCategories: categories,
      notifications,
      display: {
        currency,
        layout,
      },
    });
  };

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Account & Shopping Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize your SmartCart AI profile, shopping category priorities, default budgets, and price alert thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION A: Personal Information */}
        <div className="saas-card p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <User className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Personal Information
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-xl shadow-md">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B: Shopping Preferences */}
        <div className="saas-card p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <ShoppingBag className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Shopping Preferences
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Preferred Retailers */}
            <div>
              <label className="block font-semibold text-slate-700 mb-2">
                Preferred Retailer Sources
              </label>
              <div className="flex flex-wrap gap-2.5">
                {availableRetailers.map((ret) => {
                  const active = retailers.includes(ret);
                  return (
                    <button
                      key={ret}
                      type="button"
                      onClick={() => handleToggleRetailer(ret)}
                      className={`px-3.5 py-2 rounded-xl font-semibold border transition-all ${
                        active
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {active ? `✓ ${ret}` : ret}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Categories */}
            <div className="pt-2">
              <label className="block font-semibold text-slate-700 mb-2">
                Priority Categories for CART Recommendations
              </label>
              <div className="flex flex-wrap gap-2.5">
                {availableCategories.map((cat) => {
                  const active = categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleToggleCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl font-semibold border transition-all ${
                        active
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {active ? `✓ ${cat}` : cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Default Budget */}
            <div className="pt-2 max-w-sm">
              <label className="block font-semibold text-slate-700 mb-1">
                Default Quarterly Shopping Budget (INR ₹)
              </label>
              <input
                type="number"
                min={1000}
                value={defaultBudget}
                onChange={(e) => setDefaultBudget(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>
          </div>
        </div>

        {/* SECTION C: Notification Preferences */}
        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Bell className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Notification & Alert Settings
            </h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">
                  Price Drop Alerts
                </span>
                <span className="text-slate-500 text-[11px]">
                  Receive immediate alerts when watched products drop below your target.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.priceDrops}
                onChange={(e) =>
                  setNotifications({ ...notifications, priceDrops: e.target.checked })
                }
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">
                  Festival Deal Notifications
                </span>
                <span className="text-slate-500 text-[11px]">
                  Alerts when verified products enter flash sale windows on Amazon or Flipkart.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.dealAlerts}
                onChange={(e) =>
                  setNotifications({ ...notifications, dealAlerts: e.target.checked })
                }
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">
                  Budget Threshold Warnings
                </span>
                <span className="text-slate-500 text-[11px]">
                  Warn when a category spending exceeds 80% of its budget cap.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.budgetThresholds}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    budgetThresholds: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION D: Display & Layout Preferences */}
        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Sliders className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Display & Layout Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Display Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="INR">Indian Rupee (INR ₹)</option>
                <option value="USD">US Dollar (USD $)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Dashboard View Density
              </label>
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="comfortable">Comfortable (Recommended)</option>
                <option value="compact">Compact Density</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.01]"
          >
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </button>

          <span className="text-xs text-slate-400">
            Preferences sync with local browser storage
          </span>
        </div>
      </form>

      {/* Danger Zone: Account Deletion */}
      <div className="saas-card p-6 border-rose-200 bg-rose-50/30 space-y-3">
        <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
          <Shield className="h-4 w-4 text-rose-600" />
          <span>Account Security & Reset</span>
        </h3>
        <p className="text-xs text-rose-800 leading-relaxed">
          Reset all stored demo data including watchlist items, budgets, expenses, and AI chat history.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm("Reset all local demo data to defaults?")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
          <span>Reset Demo Data to Defaults</span>
        </button>
      </div>
    </div>
  );
}
