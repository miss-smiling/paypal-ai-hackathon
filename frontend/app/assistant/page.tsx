"use client";

import { useState } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShoppingBag,
  SlidersHorizontal,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Cpu,
  BatteryCharging,
  ArrowRight,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";
import { NOVATEK_PRODUCTS, NovatekProduct } from "@/lib/novatekData";

interface AgentStep {
  agent: string;
  status: "done" | "active" | "waiting";
  detail: string;
}

interface AssistantExchange {
  id: string;
  query: string;
  timestamp: string;
  intent: {
    category: string;
    budgetLimit: number | null;
    desiredFeatures: string[];
  };
  steps: AgentStep[];
  decisionMatrix: {
    product: NovatekProduct;
    matchScore: number;
    trustScore: number;
    valueScore: number;
    verdict: string;
  }[];
  topPick: NovatekProduct;
  alternatives: NovatekProduct[];
  aiReasoning: string;
}

export default function AssistantPage() {
  const { addToCart, toggleCompare, isComparing, setQuickViewProduct, subtotal } = useNovatek();
  const [inputQuery, setInputQuery] = useState("");
  const [budgetLimit, setBudgetLimit] = useState<number>(1500);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sample prompt chips
  const samplePrompts = [
    { label: "🎧 ANC Headphones under $350 with 40h battery", query: "ANC headphones under 350 with long battery" },
    { label: "💻 High performance laptop for developers", query: "Fast developer laptop under 1400 with great battery" },
    { label: "⌚ Titanium sports smartwatch with ECG", query: "Titanium smartwatch with health sensors and GPS" },
    { label: "⚡ Universal multi-port GaN travel charger", query: "GaN charger for laptop and phone under 100" },
  ];

  // Default initial recommendation state
  const [history, setHistory] = useState<AssistantExchange[]>([
    {
      id: "initial-1",
      query: "ANC headphones with over 30h battery life for travel",
      timestamp: "Just now",
      intent: {
        category: "Audio",
        budgetLimit: 400,
        desiredFeatures: ["Active Noise Cancellation", "Battery > 30h", "Travel Comfort"],
      },
      steps: [
        { agent: "Intent Parser", status: "done", detail: "Parsed category: Audio, Feature: ANC, Battery: >30h" },
        { agent: "Spec Discovery", status: "done", detail: "Scanned 8 acoustic hardware devices, 2 matched criteria" },
        { agent: "Review Trust Guard", status: "done", detail: "Scored 99% verified review integrity, removed 14 promo bots" },
        { agent: "Budget Optimizer", status: "done", detail: "Within $400 budget, calculated best bundle value" },
      ],
      decisionMatrix: [
        {
          product: NOVATEK_PRODUCTS.find((p) => p.id === "novasound-max") || NOVATEK_PRODUCTS[4],
          matchScore: 98,
          trustScore: 99,
          valueScore: 95,
          verdict: "Top Recommended: 50h playback, 45dB hybrid ANC, beryllium acoustic drivers.",
        },
        {
          product: NOVATEK_PRODUCTS.find((p) => p.id === "novabuds-pro") || NOVATEK_PRODUCTS[1],
          matchScore: 92,
          trustScore: 96,
          valueScore: 94,
          verdict: "Budget Alternative: Pocket form factor, 32h case battery, $199 price point.",
        },
      ],
      topPick: NOVATEK_PRODUCTS.find((p) => p.id === "novasound-max") || NOVATEK_PRODUCTS[4],
      alternatives: [NOVATEK_PRODUCTS.find((p) => p.id === "novabuds-pro") || NOVATEK_PRODUCTS[1]],
      aiReasoning:
        "Based on your travel requirement and battery threshold, **NovaSound Max** is the superior match. Its 50-hour playback exceeds your 30h requirement by 66%, and 45dB hybrid noise cancellation shuts out airplane cabin frequencies. If you prioritize pocket compactness, **NovaBuds Pro** saves $150 while delivering high-grade adaptive noise reduction.",
    },
  ]);

  const handleRunAgent = (queryToRun?: string) => {
    const q = (queryToRun || inputQuery).trim();
    if (!q) return;

    setIsProcessing(true);
    if (!queryToRun) setInputQuery("");

    setTimeout(() => {
      const qLower = q.toLowerCase();
      let topPick = NOVATEK_PRODUCTS[0];
      let alternatives: NovatekProduct[] = [];
      let category = "All Hardware";
      let reasoning = "";

      if (qLower.includes("laptop") || qLower.includes("code") || qLower.includes("program") || qLower.includes("macbook") || qLower.includes("developer")) {
        category = "Laptops";
        topPick = NOVATEK_PRODUCTS.find((p) => p.id === "novabook-air-m2") || NOVATEK_PRODUCTS[2];
        alternatives = [NOVATEK_PRODUCTS.find((p) => p.id === "novapad-ultra-12") || NOVATEK_PRODUCTS[7]];
        reasoning =
          "The **NovaBook Air M2** is engineered with an 8-core CPU, 10-core GPU, and 18-hour battery life inside a fanless silent aluminum unibody. It easily compiles code, drives external displays, and stays cool with zero throttling. As a secondary portable option, **NovaPad Ultra 12** offers a 120Hz OLED screen and stylus input for sketching.";
      } else if (qLower.includes("watch") || qLower.includes("fitness") || qLower.includes("health") || qLower.includes("gps") || qLower.includes("heart")) {
        category = "Wearables";
        topPick = NOVATEK_PRODUCTS.find((p) => p.id === "novawatch-x") || NOVATEK_PRODUCTS[3];
        alternatives = [NOVATEK_PRODUCTS.find((p) => p.id === "novabuds-pro") || NOVATEK_PRODUCTS[1]];
        reasoning =
          "The **NovaWatch X** is our flagship wearable, featuring aerospace titanium, sapphire crystal glass, 50m swimproof water resistance, ECG diagnostic sensors, and a 7-day battery life. We recommend pairing it with **NovaBuds Pro** for phone-free workout tracking.";
      } else if (qLower.includes("charger") || qLower.includes("gan") || qLower.includes("power") || qLower.includes("brick") || qLower.includes("plug")) {
        category = "Accessories";
        topPick = NOVATEK_PRODUCTS.find((p) => p.id === "novapower-gan-120w") || NOVATEK_PRODUCTS[5];
        alternatives = [];
        reasoning =
          "**NovaPower GaN 120W Hub** is the optimal power accessory. Its gallium nitride architecture enables 120W total output across 3 USB-C ports and 1 USB-A port, capable of fast-charging a laptop and phone simultaneously while fitting in your jacket pocket.";
      } else if (qLower.includes("phone") || qLower.includes("titanium") || qLower.includes("camera") || qLower.includes("mobile")) {
        category = "Smartphones";
        topPick = NOVATEK_PRODUCTS.find((p) => p.id === "novaphone-15-pro") || NOVATEK_PRODUCTS[0];
        alternatives = [NOVATEK_PRODUCTS.find((p) => p.id === "novawatch-x") || NOVATEK_PRODUCTS[3]];
        reasoning =
          "**NovaPhone 15 Pro** delivers Grade 5 Aerospace Titanium, A17 Pro 3nm processing, 48MP pro camera system with 5x optical telephoto zoom, and up to 29 hours of battery. Verified trust rating is 98% across 2,450 authentic buyers.";
      } else {
        category = "Audio & Accessories";
        topPick = NOVATEK_PRODUCTS.find((p) => p.id === "novasound-max") || NOVATEK_PRODUCTS[4];
        alternatives = [NOVATEK_PRODUCTS.find((p) => p.id === "novabuds-pro") || NOVATEK_PRODUCTS[1]];
        reasoning =
          `I ran an agentic discovery search across all product specifications matching "${q}". **${topPick.name}** ranked highest on spec-to-price ratio and verified review sentiment.`;
      }

      const newExchange: AssistantExchange = {
        id: `exchange-${Date.now()}`,
        query: q,
        timestamp: "Just now",
        intent: {
          category,
          budgetLimit,
          desiredFeatures: ["Verified Authentic Specs", "High Trust Score", "Optimal Value"],
        },
        steps: [
          { agent: "Intent Parser", status: "done", detail: `Identified category: ${category}` },
          { agent: "Spec Discovery", status: "done", detail: `Matched top product: ${topPick.name}` },
          { agent: "Review Trust Guard", status: "done", detail: `Verified Trust Score: ${topPick.trustScore}%` },
          { agent: "Budget Optimizer", status: "done", detail: `Price $${topPick.price} fits in $${budgetLimit} budget` },
        ],
        decisionMatrix: [
          {
            product: topPick,
            matchScore: 98,
            trustScore: topPick.trustScore,
            valueScore: 96,
            verdict: topPick.tagline,
          },
          ...(alternatives.map((alt) => ({
            product: alt,
            matchScore: 89,
            trustScore: alt.trustScore,
            valueScore: 91,
            verdict: alt.tagline,
          }))),
        ],
        topPick,
        alternatives,
        aiReasoning: reasoning,
      };

      setHistory((prev) => [newExchange, ...prev]);
      setIsProcessing(false);
    }, 1100);
  };

  const remainingBudget = Math.max(0, budgetLimit - subtotal);
  const budgetSpentPct = Math.min(100, Math.round((subtotal / budgetLimit) * 100));

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-cyan-300" />
              <span>Multi-Agent Tech Concierge</span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              NovaAI Shopping Assistant
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              Describe what you need in natural language. Our autonomous agents verify technical specifications, clean review sentiment, guard your budget, and rank recommendations without sponsored bias.
            </p>
          </div>

          {/* Budget Guard Pill */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d1222] p-4 sm:min-w-[260px] shadow-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Shopping Budget</span>
              <span className="font-bold text-white">${budgetLimit}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-500"
                style={{ width: `${budgetSpentPct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Cart: ${subtotal}</span>
              <span className={remainingBudget > 0 ? "text-cyan-300 font-bold" : "text-rose-400 font-bold"}>
                Remaining: ${remainingBudget}
              </span>
            </div>
          </div>
        </div>

        {/* Search & Prompt Box */}
        <div className="mt-8 rounded-3xl border border-cyan-500/30 bg-[#0d1222]/90 p-6 shadow-2xl backdrop-blur-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunAgent();
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask e.g. 'ANC headphones under $300 with 30h battery' or 'Best coding laptop with 16GB RAM'..."
                className="w-full rounded-2xl border border-slate-700/80 bg-[#07090e] px-5 py-4 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing || !inputQuery.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:opacity-90 disabled:opacity-50 transition-all hover:scale-105"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Agents Working...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze Specs</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Prompt Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-500">Suggested queries:</span>
            {samplePrompts.map((sample) => (
              <button
                key={sample.label}
                onClick={() => handleRunAgent(sample.query)}
                className="rounded-full border border-slate-800 bg-[#090c16] px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500/50 hover:text-white transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-8 rounded-2xl border border-cyan-500/40 bg-cyan-950/20 p-6 text-center animate-pulse">
            <div className="inline-flex items-center gap-3 text-cyan-300">
              <Bot className="h-5 w-5 animate-spin" />
              <span className="text-sm font-bold">
                LangGraph Agents running: Intent extraction → Spec discovery → Trust scoring → Budget check...
              </span>
            </div>
          </div>
        )}

        {/* Results Stream */}
        <div className="mt-10 space-y-12">
          {history.map((exchange) => (
            <div
              key={exchange.id}
              className="rounded-3xl border border-slate-800 bg-[#0b0e1b] p-6 sm:p-8 shadow-2xl space-y-8"
            >
              {/* Query & Intent Header */}
              <div className="flex flex-col gap-2 border-b border-slate-800/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-cyan-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">&quot;{exchange.query}&quot;</h3>
                    <span className="text-xs text-slate-400">
                      Discovered category: <strong className="text-cyan-300">{exchange.intent.category}</strong> · {exchange.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                    Budget Cap: ${exchange.intent.budgetLimit || "Unlimited"}
                  </span>
                </div>
              </div>

              {/* Multi-Agent Execution Trace (4 Steps) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                  <Zap className="h-3.5 w-3.5 text-cyan-400" />
                  Agent Execution Pipeline Trace
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {exchange.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800/80 bg-[#080b14] p-3 text-xs"
                    >
                      <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
                        <span>{step.agent}</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <p className="text-[11px] text-slate-400">{step.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Reasoning Summary */}
              <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-slate-900/40 p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  <Bot className="h-4 w-4 text-cyan-400" />
                  <span>Autonomous Recommendation Reasoning</span>
                </div>
                <p className="mt-2 text-sm text-slate-200 leading-relaxed">
                  {exchange.aiReasoning}
                </p>
              </div>

              {/* Top Pick Product Card */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                    Verified Top Pick
                  </h4>
                  <span className="text-xs text-slate-400">
                    Highest Spec-to-Value Score
                  </span>
                </div>

                <div className="rounded-2xl border border-cyan-400/50 bg-[#0e1426] p-6 shadow-xl shadow-cyan-500/10 transition-all">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-12 items-center">
                    
                    {/* Thumbnail */}
                    <div
                      onClick={() => setQuickViewProduct(exchange.topPick)}
                      className="cursor-pointer md:col-span-3 flex aspect-square items-center justify-center rounded-xl bg-[#07090e] p-4 border border-slate-800"
                    >
                      <img
                        src={exchange.topPick.image}
                        alt={exchange.topPick.name}
                        className="h-full w-full object-contain filter contrast-105"
                      />
                    </div>

                    {/* Details */}
                    <div className="md:col-span-6 space-y-3">
                      <div className="flex items-center gap-2">
                        {exchange.topPick.badge && (
                          <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                            {exchange.topPick.badge}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">{exchange.topPick.category}</span>
                        <div className="flex items-center gap-1 text-xs text-cyan-400 font-bold ml-auto sm:ml-0">
                          <ShieldCheck className="h-4 w-4" />
                          <span>{exchange.topPick.trustScore}% Verified Trust</span>
                        </div>
                      </div>

                      <h3
                        onClick={() => setQuickViewProduct(exchange.topPick)}
                        className="text-xl font-black text-white hover:text-cyan-300 cursor-pointer"
                      >
                        {exchange.topPick.name}
                      </h3>

                      <p className="text-xs text-slate-300">
                        {exchange.topPick.description}
                      </p>

                      {/* Specs pills */}
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {exchange.topPick.specs.processor && (
                          <span className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-slate-300">
                            ⚡ {exchange.topPick.specs.processor}
                          </span>
                        )}
                        {exchange.topPick.specs.battery && (
                          <span className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-slate-300">
                            🔋 {exchange.topPick.specs.battery}
                          </span>
                        )}
                        {exchange.topPick.specs.build && (
                          <span className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-slate-300">
                            🛡️ {exchange.topPick.specs.build}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pricing & Cart Action */}
                    <div className="md:col-span-3 flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 space-y-3">
                      <div className="text-right">
                        <div className="text-2xl font-black text-white">
                          ${exchange.topPick.price}
                        </div>
                        {exchange.topPick.originalPrice && (
                          <span className="text-xs text-slate-500 line-through">
                            ${exchange.topPick.originalPrice}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(exchange.topPick)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all hover:scale-105"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>Add to Bag</span>
                      </button>

                      <button
                        onClick={() => toggleCompare(exchange.topPick)}
                        className={`w-full flex items-center justify-center gap-2 rounded-xl border py-2 text-xs font-semibold transition-all ${
                          isComparing(exchange.topPick.id)
                            ? "border-cyan-400 bg-cyan-500 text-slate-950 font-bold"
                            : "border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white"
                        }`}
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span>{isComparing(exchange.topPick.id) ? "Comparing" : "Compare"}</span>
                      </button>
                    </div>

                  </div>
                </div>
              </div>

              {/* Decision Matrix Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Multi-Factor Evaluation Matrix
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#080b14]">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                      <tr>
                        <th className="p-3.5">Candidate</th>
                        <th className="p-3.5">Price</th>
                        <th className="p-3.5">Spec Match</th>
                        <th className="p-3.5">Review Trust</th>
                        <th className="p-3.5">Value Score</th>
                        <th className="p-3.5">Decision Verdict</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {exchange.decisionMatrix.map((row) => (
                        <tr key={row.product.id} className="hover:bg-slate-900/40">
                          <td className="p-3.5 font-bold text-white flex items-center gap-2">
                            <img
                              src={row.product.image}
                              alt={row.product.name}
                              className="h-8 w-8 object-contain rounded bg-[#07090e] p-1"
                            />
                            <span>{row.product.name}</span>
                          </td>
                          <td className="p-3.5 font-semibold text-cyan-300">${row.product.price}</td>
                          <td className="p-3.5">
                            <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 font-bold text-cyan-300">
                              {row.matchScore}%
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-300">
                              {row.trustScore}%
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-white">{row.valueScore}/100</td>
                          <td className="p-3.5 text-slate-300 max-w-xs">{row.verdict}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
