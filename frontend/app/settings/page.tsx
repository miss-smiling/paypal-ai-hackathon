"use client";

import { useState } from "react";
import { Sliders, Shield, Bell, CreditCard, Check } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";

export default function SettingsPage() {
  const { addToast } = useNovatek();
  const [currency, setCurrency] = useState("USD");
  const [notifications, setNotifications] = useState(true);
  const [autoApplyDeals, setAutoApplyDeals] = useState(true);

  const handleSave = () => {
    addToast("Preferences Saved", "Your SmartCart account settings have been updated.", "success");
  };

  return (
    <div className="min-h-screen bg-[#07090f] py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="rounded-3xl border border-slate-800 bg-[#0d1222] p-8 shadow-2xl">
          <h1 className="text-3xl font-black text-white">Account & Store Settings</h1>
          <p className="mt-1 text-sm text-slate-400">
            Customize your store experience, payment preferences, and AI agent permissions.
          </p>
        </div>

        {/* Settings Sections */}
        <div className="rounded-3xl border border-slate-800 bg-[#0a0e1c] p-6 sm:p-8 space-y-6">
          
          {/* Currency */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
            <div>
              <h3 className="text-sm font-bold text-white">Store Currency</h3>
              <p className="text-xs text-slate-400">Select standard display currency for pricing</p>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-xl border border-slate-700 bg-[#07090e] px-4 py-2 text-xs font-semibold text-white focus:outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          {/* AI Autonomous Deals */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
            <div>
              <h3 className="text-sm font-bold text-white">Autonomous Coupon Optimization</h3>
              <p className="text-xs text-slate-400">Automatically test and apply the best promo code at checkout</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={autoApplyDeals}
                onChange={(e) => setAutoApplyDeals(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Notification Alerts */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
            <div>
              <h3 className="text-sm font-bold text-white">Restock & Flash Deal Alerts</h3>
              <p className="text-xs text-slate-400">Receive instant push notifications when watchlist products go on sale</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Payment Integrations */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h3 className="text-sm font-bold text-white">PayPal Sandbox Integration</h3>
              <p className="text-xs text-slate-400">Orders v2 REST Mock / Live Mode Active</p>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              Verified
            </span>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-500/30"
            >
              Save Changes
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
