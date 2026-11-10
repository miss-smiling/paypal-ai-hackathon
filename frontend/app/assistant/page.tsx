"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { SearchResult } from "@/lib/types";

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  result?: SearchResult;
}

const STARTER_PROMPTS = [
  "Find boAt Rockerz ANC headphones under 2000",
  "65W GaN fast charger with 3 ports under 2500",
  "Cosmic Byte RGB mechanical keyboard under 3000",
  "Weatherproof laptop backpack 25L under 2000",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      sender: "agent",
      text: "Namaste! I am your SmartCart AI Autonomous Shopping Assistant. Tell me your budget, required specifications, or ideal gadget in natural language. I will discover real deals, filter out fake reviews, and optimize your cart for PayPal checkout.",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(textToSend?: string) {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const sid = localStorage.getItem("smartcart_session_id") || "assistant-session";
      const searchRes = await api.search(sid, query, null);

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: searchRes.message || `I analyzed market options for "${query}". Found ${searchRes.matrix.length} verified products. Top pick is ${searchRes.top_pick ? "selected" : "available"} with review trust scoring completed.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        result: searchRes,
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "agent",
          text: "I experienced a temporary network issue contacting the multi-agent graph. Please try again or explore our curated deals on the Home page.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-2.5 shadow-lg shadow-cyan-500/20">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">AI Shopping Assistant</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Interactive multi-agent conversational commerce powered by LangGraph &amp; Gemini.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Thread */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 sm:p-6 shadow-2xl backdrop-blur-md min-h-[460px] flex flex-col justify-between">
        <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-br-none shadow-md"
                    : "bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none shadow-md"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    {m.sender === "user" ? "You" : "SmartCart Autonomous Agent"}
                  </span>
                  <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                </div>
                <p className="whitespace-pre-wrap">{m.text}</p>

                {/* If result attached */}
                {m.result && m.result.matrix.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                    <p className="text-xs font-bold text-cyan-400">Agent Discovered Picks:</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {m.result.matrix.slice(0, 2).map((item) => (
                        <div key={item.product.id} className="rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-xs">
                          <p className="font-bold text-white truncate">{item.product.name}</p>
                          <p className="text-cyan-300 font-black mt-0.5">₹{item.product.price}</p>
                          <p className="text-[10px] text-emerald-400 mt-0.5">Trust Score: {item.trust_score}/100</p>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/"
                      className="inline-block mt-2 text-xs font-bold text-cyan-400 hover:underline"
                    >
                      &rarr; View Full Decision Matrix &amp; Checkout on Home
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 w-fit">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              <span>Agent is querying stores and filtering reviews...</span>
            </div>
          )}
        </div>

        {/* Input & Starter Prompts */}
        <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
          <div className="flex flex-wrap gap-2">
            {STARTER_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                className="rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything, e.g. 'Compare noise cancelling headphones under 2000'..."
              className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3 font-bold text-xs text-white shadow-lg disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
