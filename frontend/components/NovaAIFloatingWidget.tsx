"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, ShoppingBag, SlidersHorizontal, ArrowRight, Sparkles } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";
import { SMARTCART_PRODUCTS, SmartCartProduct } from "@/lib/smartcartData";
import Link from "next/link";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  recommendedProducts?: SmartCartProduct[];
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
      text: "Hello! I am your SmartCart AI Concierge. What can I help you find today? Ask about flagship phones, compare cameras, or specify your budget (e.g., 'Best titanium smartphone under $1200' or 'Compare iPhone 16 Pro with Galaxy S24').",
      recommendedProducts: [SMARTCART_PRODUCTS[0], SMARTCART_PRODUCTS[1]],
    },
  ]);

  const quickPrompts = [
    "iPhone 16 Pro vs Galaxy S24",
    "Best phone for photography",
    "Smartphones under $800",
    "Longest battery life phone",
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

    // AI Multi-Agent Processing
    setTimeout(() => {
      const q = query.toLowerCase();
      let matched: SmartCartProduct[] = [];
      let responseText = "";
      const trace: string[] = [
        "Intent Agent: Extracted budget and hardware specs from prompt",
        "Trust Agent: Filtered non-verified review noise (Trust > 95%)",
        "Optimizer Agent: Ranked candidates by spec-to-value benchmark",
      ];

      if (q.includes("iphone") || q.includes("apple") || q.includes("16") || q.includes("pro")) {
        matched = [SMARTCART_PRODUCTS[0]];
        responseText =
          "**iPhone 16 Pro** ($1,199.00) is our highest-ranked flagship. Its 3nm A18 Pro silicon delivers benchmark-leading efficiency, 33 hours of video playback, and a 48MP pro camera system with 5x optical telephoto zoom.";
      } else if (q.includes("samsung") || q.includes("s24") || q.includes("galaxy")) {
        matched = [SMARTCART_PRODUCTS[1]];
        responseText =
          "**Samsung Galaxy S24** ($999.00) features on-device Galaxy AI, Snapdragon 8 Gen 3 for Galaxy, and a peak 2600-nit Dynamic AMOLED 2X display with an Armor Aluminum enclosure.";
      } else if (q.includes("pixel") || q.includes("google") || q.includes("camera") || q.includes("photo")) {
        matched = [SMARTCART_PRODUCTS[2]];
        responseText =
          "For computational photography, **Google Pixel 9** ($799.00) offers the Google Tensor G4 chipset, Gemini Nano integration, and industry-leading HDR and low-light color rendition.";
      } else if (q.includes("oneplus") || q.includes("fast") || q.includes("charge")) {
        matched = [SMARTCART_PRODUCTS[3]];
        responseText =
          "**OnePlus 12** ($899.00) is the charging speed champion with 80W SUPERVOOC charging, massive 5400mAh battery, and a 4th Gen Hasselblad camera system.";
      } else if (q.includes("deal") || q.includes("discount") || q.includes("sale") || q.includes("800")) {
        matched = [SMARTCART_PRODUCTS[4], SMARTCART_PRODUCTS[5]];
        responseText =
          "Here are our top value deals: **iPhone 15** (-15% at $849.00) and **Samsung Galaxy S23** (-20% at $719.00), both offering flagship cameras at substantial discounts.";
      } else {
        matched = [SMARTCART_PRODUCTS[0], SMARTCART_PRODUCTS[1]];
        responseText =
          `I analyzed our verified smartphone catalog for "${query}". Here are our top hardware recommendations evaluated on silicon performance, battery, and verified buyer trust.`;
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
    }, 850);
  };

  return (
    <>
      {/* Floating Trigger Pill with Plain Minimalist Avatar */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-3 rounded-full bg-[#0d1326] border border-cyan-500/40 p-2 sm:pr-5 text-white shadow-2xl shadow-cyan-950/60 transition-all duration-300 hover:scale-105 hover:border-cyan-400 hover:shadow-cyan-500/30"
        >
          {/* Plain Silhouette Avatar provided by user */}
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-400 bg-black">
            <img
              src="/avatar.png"
              alt="SmartCart AI Avatar"
              className="h-full w-full object-cover"
            />
            {/* Live green beacon dot */}
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0d1326]" />
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1">
              Ask SmartCart AI
              <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" />
            </span>
            <span className="text-[10px] text-slate-400">Autonomous Tech Advisor</span>
          </div>
        </button>
      </div>

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 flex h-[580px] w-full max-w-[420px] flex-col overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#090d1c]/95 shadow-2xl shadow-cyan-950/60 backdrop-blur-2xl animate-slide-up">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-[#0b1226] px-5 py-4">
            <div className="flex items-center gap-3">
              {/* Avatar in Header */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-cyan-400 bg-black shadow-md">
                <img
                  src="/avatar.png"
                  alt="SmartCart Assistant"
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  SmartCart AI Concierge
                  <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                    ONLINE
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Multi-Agent Commerce Engine</p>
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
          <div className="flex items-center gap-1.5 overflow-x-auto bg-[#070912] px-4 py-2 border-b border-slate-800/60 no-scrollbar">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="rounded-full border border-slate-800 bg-[#0e1428] px-2.5 py-1 text-[10px] font-medium text-slate-300 whitespace-nowrap hover:border-cyan-500/40 hover:text-white"
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
                {/* Assistant Plain Avatar in Message Bubble */}
                {msg.sender === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-400/60 bg-black">
                    <img src="/avatar.png" alt="Avatar" className="h-full w-full object-cover" />
                  </div>
                )}

                <div className="max-w-[85%] space-y-2">
                  <div
                    className={`rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "border border-slate-800 bg-[#0e1529] text-slate-200 rounded-bl-none"
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
                            className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-[#0a0e1e] p-2.5 transition-all hover:border-cyan-500/40"
                          >
                            <div
                              onClick={() => setQuickViewProduct(p)}
                              className="flex items-center gap-2.5 cursor-pointer"
                            >
                              <div className="h-10 w-10 shrink-0 rounded-lg bg-[#060810] p-1 border border-slate-800">
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
                                  ${p.price}.00
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
                                <span>Cart</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                    U
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="flex h-6 w-6 items-center justify-center rounded-full overflow-hidden border border-cyan-400/50 bg-black">
                  <img src="/avatar.png" alt="Avatar" className="h-full w-full object-cover" />
                </div>
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] text-slate-500">SmartCart agent evaluating specs...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-800/80 bg-[#070912] p-3">
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
                className="flex-1 rounded-xl border border-slate-800 bg-[#0c1020] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
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
