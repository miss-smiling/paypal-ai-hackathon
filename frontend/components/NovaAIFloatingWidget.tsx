"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User, ShoppingBag, SlidersHorizontal, ArrowRight } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";
import { NOVATEK_PRODUCTS, NovatekProduct } from "@/lib/novatekData";
import Link from "next/link";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  recommendedProducts?: NovatekProduct[];
  trace?: string[];
}

export default function NovaAIFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { addToCart, toggleCompare, isComparing, setQuickViewProduct } = useNovatek();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I'm NovaAI, your autonomous tech concierge. Tell me what you're looking for, your budget, or specific specs (e.g. 'ANC headphones under $250' or 'Coding laptop with long battery').",
      recommendedProducts: [NOVATEK_PRODUCTS[4], NOVATEK_PRODUCTS[1]],
    },
  ]);

  const quickPrompts = [
    "Best ANC under $200",
    "Laptop for programming",
    "Titanium fitness smartwatch",
    "Fast multi-device charger",
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `${Date.now()}-user`,
      sender: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    // AI Reasoning Engine (Simulates agentic multi-step discovery)
    setTimeout(() => {
      const q = query.toLowerCase();
      let matched: NovatekProduct[] = [];
      let responseText = "";
      const trace: string[] = [
        "Intent Agent: Extracted category and spec constraints from query",
        "Trust Agent: Filtered non-verified reviews (Score > 94%)",
        "Optimizer Agent: Ranked by spec-to-value ratio",
      ];

      if (q.includes("headphone") || q.includes("anc") || q.includes("audio") || q.includes("earbud") || q.includes("sound")) {
        if (q.includes("earbud") || q.includes("200")) {
          matched = [NOVATEK_PRODUCTS.find((p) => p.id === "novabuds-pro") || NOVATEK_PRODUCTS[1]];
          responseText =
            "For active noise cancellation under $200, **NovaBuds Pro** ($199) is our top verified pick. It features 2x stronger ANC with Adaptive Audio and 32 hours total battery life.";
        } else {
          matched = [
            NOVATEK_PRODUCTS.find((p) => p.id === "novasound-max") || NOVATEK_PRODUCTS[4],
            NOVATEK_PRODUCTS.find((p) => p.id === "novabuds-pro") || NOVATEK_PRODUCTS[1],
          ];
          responseText =
            "I found 2 top-tier acoustic matches. **NovaSound Max** provides pro-grade 45dB hybrid ANC and 50h battery for immersive studio audio, while **NovaBuds Pro** gives pocketable portability.";
        }
      } else if (q.includes("laptop") || q.includes("coding") || q.includes("program") || q.includes("work") || q.includes("macbook")) {
        matched = [NOVATEK_PRODUCTS.find((p) => p.id === "novabook-air-m2") || NOVATEK_PRODUCTS[2]];
        responseText =
          "For development and intensive multitasking, **NovaBook Air M2** ($1299) offers exceptional power-per-watt with its 8-core CPU / 10-core GPU, 18 hours of battery, and fanless silent operation.";
      } else if (q.includes("watch") || q.includes("fitness") || q.includes("health") || q.includes("run") || q.includes("swim")) {
        matched = [NOVATEK_PRODUCTS.find((p) => p.id === "novawatch-x") || NOVATEK_PRODUCTS[3]];
        responseText =
          "**NovaWatch X** ($249, on sale) is engineered with an aerospace titanium bezel, sapphire glass, on-demand ECG, dual-frequency GPS, and up to 7 days of endurance.";
      } else if (q.includes("charger") || q.includes("gan") || q.includes("power") || q.includes("travel")) {
        matched = [NOVATEK_PRODUCTS.find((p) => p.id === "novapower-gan-120w") || NOVATEK_PRODUCTS[5]];
        responseText =
          "**NovaPower GaN 120W Hub** ($79) replaces all bulky bricks with 3x USB-C Power Delivery ports and 1x USB-A port to simultaneously fast-charge laptops, phones, and tablets.";
      } else if (q.includes("phone") || q.includes("titanium") || q.includes("camera") || q.includes("iphone")) {
        matched = [NOVATEK_PRODUCTS.find((p) => p.id === "novaphone-15-pro") || NOVATEK_PRODUCTS[0]];
        responseText =
          "**NovaPhone 15 Pro** ($999) delivers aerospace Grade 5 Titanium, 48MP pro camera system with 5x optical zoom, and the 3nm A17 Pro chip for next-gen performance.";
      } else {
        matched = [NOVATEK_PRODUCTS[0], NOVATEK_PRODUCTS[1]];
        responseText =
          `I analyzed our hardware catalog for "${query}". Here are our top verified matching hardware recommendations that balance price, specs, and verified customer trust.`;
      }

      const botMsg: Message = {
        id: `${Date.now()}-assistant`,
        sender: "assistant",
        text: responseText,
        recommendedProducts: matched,
        trace,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <>
      {/* Floating Trigger Pill */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 p-3.5 sm:px-5 sm:py-3.5 text-white shadow-2xl shadow-blue-500/40 transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/50"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-cyan-200" />
          </div>
          <span className="hidden sm:inline text-xs font-bold tracking-wide">
            Ask NovaAI Assistant
          </span>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300"></span>
          </span>
        </button>
      </div>

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 flex h-[580px] w-full max-w-[420px] flex-col overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#090d1a]/95 shadow-2xl shadow-cyan-950/50 backdrop-blur-2xl animate-slide-up">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-[#0d1224] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#090d1a]">
                  <Bot className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  NovaAI Concierge
                  <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300">
                    ONLINE
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Autonomous Spec & Value Advisor</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/assistant"
                className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 underline"
              >
                Full Screen
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto bg-[#070a14] px-4 py-2 border-b border-slate-800/60 no-scrollbar">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="rounded-full border border-slate-800 bg-[#0e1322] px-2.5 py-1 text-[10px] font-medium text-slate-300 whitespace-nowrap hover:border-cyan-500/40 hover:text-white"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "assistant" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "border border-slate-800 bg-[#0e1424] text-slate-200 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>

                  {/* Multi-Agent Reasoning Trace */}
                  {msg.trace && (
                    <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-2 text-[10px] text-cyan-300 space-y-1">
                      <div className="font-bold flex items-center gap-1 text-[10px]">
                        <Sparkles className="h-3 w-3" /> Agent Decision Trace
                      </div>
                      {msg.trace.map((step, idx) => (
                        <div key={idx} className="text-slate-400">· {step}</div>
                      ))}
                    </div>
                  )}

                  {/* Embedded Product Cards in Assistant Bubble */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {msg.recommendedProducts.map((p) => {
                        const inCompare = isComparing(p.id);
                        return (
                          <div
                            key={p.id}
                            className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-[#0b101e] p-2.5 transition-all hover:border-cyan-500/40"
                          >
                            <div
                              onClick={() => setQuickViewProduct(p)}
                              className="flex items-center gap-2.5 cursor-pointer"
                            >
                              <div className="h-10 w-10 shrink-0 rounded-lg bg-[#07090e] p-1 border border-slate-800">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <div>
                                <h4 className="text-[11px] font-bold text-white hover:text-cyan-300">
                                  {p.name}
                                </h4>
                                <span className="text-[10px] font-bold text-cyan-400">
                                  ${p.price}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => toggleCompare(p)}
                                title={inCompare ? "Remove compare" : "Add to compare"}
                                className={`rounded-lg p-1.5 text-[10px] ${
                                  inCompare
                                    ? "bg-cyan-500 text-slate-950 font-bold"
                                    : "border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
                                }`}
                              >
                                <SlidersHorizontal className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => addToCart(p)}
                                className="flex items-center gap-1 rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-blue-500"
                              >
                                <ShoppingBag className="h-3 w-3" />
                                <span>Bag</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300 text-xs">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Bot className="h-4 w-4 text-cyan-400" />
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] text-slate-500">Evaluating specs & trust scores...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-800/80 bg-[#070a14] p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about specs, budget, or use-case..."
                className="flex-1 rounded-xl border border-slate-800 bg-[#0c101e] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-500 disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
