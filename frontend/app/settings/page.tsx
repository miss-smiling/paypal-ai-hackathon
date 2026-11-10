"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [currency, setCurrency] = useState("INR");
  const [aiEngine, setAiEngine] = useState("gemini");
  const [sandboxMode, setSandboxMode] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400 mb-2">
          <span>⚙️ Platform Preferences</span>
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white">System Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure multi-agent parameters, sandbox payment credentials, and review filtering rules.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Currency Setting */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Base Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full sm:w-72 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
          >
            <option value="INR">INR (₹) - Indian Rupee (Default)</option>
            <option value="USD">USD ($) - US Dollar</option>
            <option value="EUR">EUR (€) - Euro</option>
          </select>
          <p className="text-[11px] text-slate-500">Determines pricing formatting across all agent recommendations.</p>
        </div>

        {/* AI Engine Setting */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Intent &amp; Spec Extraction AI</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { id: "gemini", name: "Google Gemini 1.5", desc: "Default multimodal model" },
              { id: "openai", name: "OpenAI GPT-4o", desc: "Automatic fallback" },
              { id: "rules", name: "Deterministic Rules", desc: "Keyless offline mode" },
            ].map((engine) => (
              <div
                key={engine.id}
                onClick={() => setAiEngine(engine.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  aiEngine === engine.id
                    ? "border-cyan-500 bg-cyan-500/10 text-white"
                    : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                <p className="text-xs font-bold">{engine.name}</p>
                <p className="text-[10px] mt-0.5 opacity-70">{engine.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PayPal Sandbox Mode */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Payment Gateway Mode</label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="sandbox"
              checked={sandboxMode}
              onChange={(e) => setSandboxMode(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500"
            />
            <label htmlFor="sandbox" className="text-xs text-slate-300 cursor-pointer">
              Enable PayPal Orders v2 Sandbox mode (Recommended for Hackathon demo testing)
            </label>
          </div>
        </div>

        {/* Fraud Velocity Rules */}
        <div className="rounded-2xl bg-slate-900 p-4 border border-slate-800 space-y-1 text-xs text-slate-400">
          <p className="font-bold text-white">Active Fraud Guardrails:</p>
          <p>&bull; Velocity Check: Maximum 3 orders per 10 minutes allowed per session.</p>
          <p>&bull; Explicit Consent: Block payment creation without shopper approval flag.</p>
          <p>&bull; Zero Double-Charge: Mandatory Idempotency-Key request headers.</p>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleSave}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90"
          >
            Save Preferences
          </button>
          {saved && <span className="text-xs text-emerald-400 font-semibold">Settings saved!</span>}
        </div>
      </div>
    </div>
  );
}
