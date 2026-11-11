"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Plus,
  MessageSquare,
  SlidersHorizontal,
  Star,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Info,
  Clock,
  Layers,
  Search,
  Check,
} from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";
import { chatService } from "@/lib/services";
import { ChatMessage, SavedConversation, ChatProductCard } from "@/lib/types";
import { formatINR, MOCK_SAVED_CONVERSATIONS } from "@/lib/mockData";

export default function AssistantPage() {
  const { addToCompare, isComparing, addToast } = useSmartCart();
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("conv-1");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = chatService.getConversations();
    setConversations(list);
    const active = list.find((c) => c.id === activeConversationId) || list[0];
    if (active && active.messages.length > 0) {
      setMessages(active.messages);
    } else {
      // Default initial exchange
      setMessages(MOCK_SAVED_CONVERSATIONS[0].messages);
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isThinking) return;

    const userMessage: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText("");
    setIsThinking(true);

    try {
      const response = await chatService.generateAiResponse(text);
      setMessages((prev) => [...prev, response]);
    } catch {
      addToast("Connection Error", "Could not fetch AI response. Try again.", "error");
    } finally {
      setIsThinking(false);
    }
  };

  const handleNewConversation = () => {
    const newConv: SavedConversation = {
      id: "conv-" + Date.now(),
      title: "New Shopping Inquiry",
      preview: "Started a fresh shopping consultation...",
      date: "Just now",
      messages: [],
    };
    setConversations([newConv, ...conversations]);
    setActiveConversationId(newConv.id);
    setMessages([]);
  };

  const suggestedPrompts = [
    "Find the best laptop under ₹70,000 for programming",
    "Compare iPhone 15 and Samsung Galaxy S24",
    "Find the best value-for-money ANC headphones",
    "Help me plan a ₹1,00,000 electronics shopping budget",
    "Find products with verified 4.5+ star review ratings",
  ];

  const cartCapabilities = [
    "Natural-language product search",
    "Budget-aware recommendations",
    "Cross-platform price comparison",
    "Hardware specification analysis",
    "Review sentiment summaries",
    "Alternative product suggestions",
    "Value-for-money scoring",
  ];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row gap-6 animate-fade-in">
      {/* LEFT COLUMN: Sidebar with History, New Chat & Capabilities */}
      <div className="hidden lg:flex flex-col w-80 saas-card p-4 justify-between shrink-0">
        <div className="space-y-4">
          {/* New Conversation Button */}
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-4 shadow-sm transition-all hover:scale-[1.01]"
          >
            <Plus className="h-4 w-4" />
            <span>New Consultation</span>
          </button>

          {/* Saved Conversations */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Saved Consultations
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start gap-2.5 ${
                    activeConversationId === conv.id
                      ? "bg-indigo-50 border border-indigo-100 text-indigo-900 font-semibold"
                      : "text-slate-600 hover:bg-slate-100/80"
                  }`}
                >
                  <MessageSquare className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{conv.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{conv.preview}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Prompts */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Suggested Prompts
            </h4>
            <div className="space-y-1">
              {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left p-2 rounded-lg text-[11px] text-slate-600 hover:bg-indigo-50/60 hover:text-indigo-700 transition-colors truncate block"
                >
                  → {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CART Capabilities Box */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 space-y-2 mt-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>CART AI Capabilities</span>
          </div>
          <ul className="text-[11px] text-indigo-800/80 space-y-1">
            {cartCapabilities.map((cap, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-indigo-600 shrink-0" />
                <span className="truncate">{cap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT COLUMN: Main Chat Interface */}
      <div className="flex-1 saas-card flex flex-col justify-between overflow-hidden shadow-card">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">CART</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Online Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Personalized shopping consultant powered by real-time catalog specs
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <span>Unbiased · No Sponsored Ads</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="py-10 max-w-lg mx-auto text-center space-y-4">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-100 text-indigo-600">
                <Bot className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Hi! I&apos;m CART, your personal shopping intelligence assistant.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Tell me what you&apos;re looking for, your budget, and what matters most.
                I&apos;ll help you compare options and make a smarter buying decision.
              </p>

              <div className="pt-4 text-left space-y-2">
                <span className="text-xs font-semibold text-slate-400 block text-center">
                  Try asking one of these:
                </span>
                {suggestedPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(p)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all text-left flex items-center justify-between"
                  >
                    <span>{p}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xs"
                  }`}
                >
                  {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Content Box */}
                <div className="space-y-3">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-tr-xs"
                        : "bg-white border border-slate-200/80 text-slate-800 rounded-tl-xs shadow-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>

                  {/* Rich Product Cards Grid if returned by CART */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {msg.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="saas-card p-3.5 bg-white border border-slate-200 flex flex-col justify-between space-y-3 hover:border-indigo-300 transition-colors"
                        >
                          <div>
                            <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 mb-2 relative">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="h-full w-full object-cover"
                              />
                              {prod.badge && (
                                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-600 text-white shadow-xs">
                                  {prod.badge}
                                </span>
                              )}
                              <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/90 text-slate-800 shadow-2xs">
                                {prod.retailer}
                              </span>
                            </div>

                            <h5 className="font-bold text-xs text-slate-900 line-clamp-2">
                              {prod.name}
                            </h5>

                            <div className="flex items-center justify-between mt-1 text-[11px]">
                              <span className="font-black text-indigo-600">
                                {formatINR(prod.price)}
                              </span>
                              <div className="flex items-center gap-0.5 text-amber-600 font-semibold">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span>{prod.rating}</span>
                              </div>
                            </div>

                            <p className="mt-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-md">
                              {prod.aiNote}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => addToCompare(prod.id)}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                                isComparing(prod.id)
                                  ? "bg-indigo-600 text-white"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                              }`}
                            >
                              {isComparing(prod.id) ? "Comparing" : "Compare"}
                            </button>
                            <Link
                              href={`/product/${prod.id}`}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-semibold"
                            >
                              Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI Verdict Box */}
                  {msg.aiVerdict && (
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50/80 to-violet-50/80 border border-indigo-100 text-xs text-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                        <span>CART Verdict:</span>
                      </div>
                      <p className="leading-relaxed">{msg.aiVerdict}</p>
                    </div>
                  )}

                  {/* Follow up prompt suggestions */}
                  {msg.followUps && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Suggested follow-ups:
                      </span>
                      {msg.followUps.map((fu, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(fu)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-700 transition-colors"
                        >
                          {fu}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Thinking animation state */}
          {isThinking && (
            <div className="flex items-center gap-3 text-slate-500 text-xs p-3 max-w-md bg-white border border-slate-200 rounded-2xl shadow-xs animate-pulse">
              <Bot className="h-4 w-4 text-indigo-600 animate-spin" />
              <span>CART is cross-referencing benchmarks, prices & seller ratings...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Disclaimer Bar */}
        <div className="px-6 py-2 bg-slate-100/80 border-t border-slate-200 text-[11px] text-slate-500 text-center">
          Prices and availability are illustrative based on current retailer snapshots.
          Always verify directly before checkout.
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask CART anything (e.g. 'Best laptop under ₹70,000 for coding' or 'Compare S24 vs iPhone 15')..."
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={isThinking || !inputText.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm px-5 py-3 shadow-sm transition-all"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
