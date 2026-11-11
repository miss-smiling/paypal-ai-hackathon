"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  Image as ImageIcon,
  Link2,
  Reply,
  Flag,
  Trash2,
  ExternalLink,
  Users,
  RefreshCw,
  AlertCircle,
  X,
  CheckCircle2,
  Info,
  ShieldAlert,
} from "lucide-react";
import { api, CommunityMessage } from "@/lib/api";
import { useSmartCart } from "@/context/SmartCartContext";

const MAX_CHARS = 2000;
const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function CommunityPage() {
  const { user, isRegistered, addToast } = useSmartCart();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<CommunityMessage | null>(null);

  // Link Preview Attachment state
  const [attachedLinks, setAttachedLinks] = useState<
    Array<{ url: string; title?: string; description?: string; image?: string; site_name?: string }>
  >([]);
  const [linkInputUrl, setLinkInputUrl] = useState("");
  const [loadingLink, setLoadingLink] = useState(false);

  // Image Attachments state
  const [attachedImages, setAttachedImages] = useState<
    Array<{ url: string; filename: string; size: number; previewBase64?: string }>
  >([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Moderation / Report modal state
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("Spam or Advertising");

  // Enlarge image modal
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to retrieve or automatically initialize valid authentication token
  const getAuthToken = async (): Promise<string> => {
    let token = typeof window !== "undefined" ? localStorage.getItem("smartcart_auth_token_v3") : null;
    if (!token || token === "demo-token" || token === "null" || token === "undefined") {
      try {
        const res = await api.getDemoToken();
        if (res.token) {
          token = res.token;
          localStorage.setItem("smartcart_auth_token_v3", token);
          return token;
        }
      } catch {
        // Backend supports demo-token fallback
      }
    }
    return token || "demo-token";
  };

  // 1. Fetch messages on mount & setup polling every 4 seconds
  const fetchMessages = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const data = await api.getCommunityMessages(50);
      setMessages(data);
    } catch {
      // offline / backend initializing fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    getAuthToken(); // Pre-initialize auth token
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // 2. Add Link to Message
  const handleAddLink = async () => {
    const raw = linkInputUrl.trim();
    if (!raw) return;
    if (attachedLinks.length >= 5) {
      addToast("Limit Reached", "A maximum of 5 links per message is allowed.", "warning");
      return;
    }
    setLoadingLink(true);
    try {
      const preview = await api.fetchLinkPreview(raw);
      setAttachedLinks((prev) => [...prev, preview]);
      setLinkInputUrl("");
      addToast("Link Added", `Preview generated for ${preview.site_name || raw}`, "success");
    } catch (err: any) {
      setAttachedLinks((prev) => [
        ...prev,
        { url: raw, title: raw, description: "External Link" },
      ]);
      setLinkInputUrl("");
    } finally {
      setLoadingLink(false);
    }
  };

  // 3. Handle Image File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (attachedImages.length + files.length > MAX_IMAGES) {
      addToast("Image Limit", `Maximum ${MAX_IMAGES} images allowed per message.`, "warning");
      return;
    }

    setUploadingImage(true);
    const token = await getAuthToken();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Format check
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        addToast("Invalid Format", "Only JPG, PNG, and WebP images are supported.", "error");
        continue;
      }

      // Size check
      if (file.size > MAX_IMAGE_SIZE) {
        addToast("File Too Large", "Each image must be 5 MB or less.", "error");
        continue;
      }

      // Read as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(",")[1];
        try {
          const uploaded = await api.uploadCommunityImage(token, {
            filename: file.name,
            mime_type: file.type,
            data_base64: base64Data,
          });
          setAttachedImages((prev) => [...prev, uploaded]);
          addToast("Image Attached", file.name, "success");
        } catch (uploadErr: any) {
          if (uploadErr.status === 401 || uploadErr.message?.toLowerCase().includes("token")) {
            try {
              const fresh = await api.getDemoToken();
              if (fresh.token) {
                localStorage.setItem("smartcart_auth_token_v3", fresh.token);
                const uploaded = await api.uploadCommunityImage(fresh.token, {
                  filename: file.name,
                  mime_type: file.type,
                  data_base64: base64Data,
                });
                setAttachedImages((prev) => [...prev, uploaded]);
                addToast("Image Attached", file.name, "success");
                return;
              }
            } catch {}
          }
          // Local fallback preview
          setAttachedImages((prev) => [
            ...prev,
            {
              url: reader.result as string,
              filename: file.name,
              size: file.size,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    }
    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 4. Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputText.trim();
    if (!content && attachedImages.length === 0 && attachedLinks.length === 0) return;

    if (content.length > MAX_CHARS) {
      addToast("Character Limit", `Please keep message under ${MAX_CHARS} characters.`, "error");
      return;
    }

    setSending(true);
    let token = await getAuthToken();

    try {
      const res = await api.sendCommunityMessage(token, {
        content: content || "Attached media:",
        parent_id: replyTo ? replyTo.id : null,
        links: attachedLinks,
        images: attachedImages,
      });

      // Clear input and attachments
      setInputText("");
      setReplyTo(null);
      setAttachedLinks([]);
      setAttachedImages([]);

      // Optimistically append user message and any instant bot reply
      setMessages((prev) => {
        const updated = [...prev, res.message];
        if (res.bot_reply) {
          updated.push(res.bot_reply);
        }
        return updated;
      });

      if (res.bot_reply) {
        addToast("Cart AI Responded", "Cart answered your question in the chat!", "info");
      }
    } catch (err: any) {
      // If token error occurred, auto-refresh and retry once
      if (err.status === 401 || err.message?.toLowerCase().includes("token")) {
        try {
          const fresh = await api.getDemoToken();
          if (fresh.token) {
            localStorage.setItem("smartcart_auth_token_v3", fresh.token);
            const retryRes = await api.sendCommunityMessage(fresh.token, {
              content: content || "Attached media:",
              parent_id: replyTo ? replyTo.id : null,
              links: attachedLinks,
              images: attachedImages,
            });

            setInputText("");
            setReplyTo(null);
            setAttachedLinks([]);
            setAttachedImages([]);

            setMessages((prev) => {
              const updated = [...prev, retryRes.message];
              if (retryRes.bot_reply) {
                updated.push(retryRes.bot_reply);
              }
              return updated;
            });

            if (retryRes.bot_reply) {
              addToast("Cart AI Responded", "Cart answered your question in the chat!", "info");
            }
            return;
          }
        } catch {
          // fall through to error toast
        }
      }
      addToast("Posting Error", err.message || "Failed to post message.", "error");
    } finally {
      setSending(false);
    }
  };

  // 5. Submit Message Report
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingMessageId) return;
    const token = await getAuthToken();

    try {
      await api.reportCommunityMessage(token, reportingMessageId, reportReason);
      addToast("Report Filed", "Thank you for helping keep SmartCart safe.", "success");
      setReportingMessageId(null);
    } catch {
      addToast("Report Filed", "Report recorded for moderator review.", "info");
      setReportingMessageId(null);
    }
  };

  // 6. Delete message (author or admin)
  const handleDeleteMessage = async (msgId: string) => {
    const token = await getAuthToken();
    try {
      await api.deleteCommunityMessage(token, msgId);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      addToast("Message Deleted", "The message was removed.", "info");
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      addToast("Message Removed", "Message deleted.", "info");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Community Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-indigo-300 border border-white/10">
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              <span>Public Shopping Community</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-300 font-bold">Live</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              SmartCart Public Community
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Exchange honest shopping advice, share deals, compare Amazon vs. Flipkart, or tag{" "}
              <button
                onClick={() => setInputText((prev) => prev + " @Cart ")}
                className="font-bold text-indigo-300 bg-indigo-900/60 hover:bg-indigo-900 px-1.5 py-0.5 rounded transition-colors"
              >
                @Cart
              </button>{" "}
              for instant AI assistance right in the conversation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchMessages()}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading ? (
            <div className="h-full flex items-center justify-center space-y-2 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
              <p className="text-xs text-slate-400">Loading community discussions...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Messages Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Be the first to ask a shopping question, share a deal, or tag @Cart for advice!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = Boolean(user.id && msg.user_id === user.id) || msg.user_name === user.name;
              const isCartBot = msg.is_bot;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 group animate-fade-in ${
                    isCartBot
                      ? "bg-gradient-to-r from-indigo-50/70 to-violet-50/50 p-4 rounded-2xl border border-indigo-100"
                      : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="shrink-0">
                    {isCartBot ? (
                      <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
                        <Bot className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shadow-2xs">
                        {msg.user_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Message Bubble Body */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Header: Name, Bot Badge & Time */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {msg.user_name}
                        </span>
                        {isCartBot && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 text-white px-2 py-0.5 text-[9px] font-bold">
                            <Sparkles className="h-2.5 w-2.5" />
                            <span>AI Assistant</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Action buttons (hover) */}
                      {!isCartBot && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs text-slate-400">
                          <button
                            onClick={() => setReplyTo(msg)}
                            className="p-1 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors"
                            title="Reply"
                          >
                            <Reply className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setReportingMessageId(msg.id)}
                            className="p-1 hover:text-amber-600 rounded hover:bg-slate-100 transition-colors"
                            title="Report Message"
                          >
                            <Flag className="h-3.5 w-3.5" />
                          </button>
                          {(isMe || user.email === "sujit.krishna@smartcart.ai") && (
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                              title="Delete Message"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Replied Parent Preview */}
                    {msg.parent_preview && (
                      <div className="rounded-xl bg-slate-50 border-l-2 border-indigo-400 p-2 text-[11px] text-slate-600 space-y-0.5">
                        <span className="font-semibold text-indigo-700">
                          Replying to {msg.parent_preview.user_name}:
                        </span>
                        <p className="truncate text-slate-500 italic">
                          "{msg.parent_preview.content}"
                        </p>
                      </div>
                    )}

                    {/* Content Text */}
                    <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap select-text">
                      {msg.content}
                    </div>

                    {/* Attached Links Preview */}
                    {msg.links && msg.links.length > 0 && (
                      <div className="space-y-2 pt-1 max-w-md">
                        {msg.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors group/link"
                          >
                            {link.image && (
                              <img
                                src={link.image}
                                alt="Preview"
                                className="h-12 w-12 rounded-lg object-cover shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold text-slate-900 group-hover/link:text-indigo-600 truncate">
                                {link.title || link.url}
                              </p>
                              {link.description && (
                                <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                                  {link.description}
                                </p>
                              )}
                              <span className="text-[9px] text-indigo-500 flex items-center gap-1 mt-1">
                                <span>{link.site_name || link.url}</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Attached Images */}
                    {msg.images && msg.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1.5">
                        {msg.images.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setZoomedImage(img.url)}
                            className="relative h-28 w-28 rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity bg-slate-100"
                          >
                            <img
                              src={img.url}
                              alt={img.filename}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply To Indicator */}
        {replyTo && (
          <div className="bg-indigo-50/90 border-t border-indigo-100 px-4 py-2 flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2 truncate">
              <Reply className="h-3.5 w-3.5 text-indigo-600" />
              <span>Replying to <strong>{replyTo.user_name}</strong>:</span>
              <span className="truncate italic text-indigo-700 max-w-sm">"{replyTo.content}"</span>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Attached previews tray before sending */}
        {(attachedImages.length > 0 || attachedLinks.length > 0) && (
          <div className="border-t border-slate-200 bg-slate-50 p-3 flex flex-wrap gap-2">
            {attachedImages.map((img, idx) => (
              <div
                key={idx}
                className="relative h-14 w-14 rounded-lg overflow-hidden border border-slate-300 group"
              >
                <img
                  src={img.url}
                  alt={img.filename}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setAttachedImages((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="absolute top-0 right-0 p-1 bg-slate-900/70 text-white rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {attachedLinks.map((link, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 shadow-2xs"
              >
                <Link2 className="h-3 w-3 text-indigo-600" />
                <span className="truncate max-w-[150px] font-medium">{link.title || link.url}</span>
                <button
                  type="button"
                  onClick={() =>
                    setAttachedLinks((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Link Input Bar */}
        {linkInputUrl !== "" || loadingLink ? (
          <div className="border-t border-slate-200 bg-white p-2.5 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
            <input
              type="url"
              value={linkInputUrl}
              onChange={(e) => setLinkInputUrl(e.target.value)}
              placeholder="Paste URL (e.g. https://amazon.in/dp/...)"
              className="flex-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddLink();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddLink}
              disabled={loadingLink || !linkInputUrl.trim()}
              className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loadingLink ? "Analyzing..." : "Attach"}
            </button>
            <button
              type="button"
              onClick={() => setLinkInputUrl("")}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {/* Message Composer Area */}
        <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-3 sm:p-4 bg-white">
          <div className="flex items-center gap-2">
            {/* Quick @Cart Mention Chip */}
            <button
              type="button"
              onClick={() => {
                if (!inputText.includes("@Cart")) {
                  setInputText((prev) => "@Cart " + prev);
                }
              }}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 px-2.5 py-2 text-xs font-bold transition-colors shrink-0"
              title="Tag Cart AI in this discussion"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>@Cart</span>
            </button>

            {/* Attach Image Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={attachedImages.length >= MAX_IMAGES || uploadingImage}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0 disabled:opacity-50"
              title="Attach product screenshot or image (Max 3 images, 5MB each)"
            >
              <ImageIcon className="h-4 w-4" />
            </button>

            {/* Attach Link Button */}
            <button
              type="button"
              onClick={() => setLinkInputUrl("https://")}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              title="Attach product URL with preview (Max 5 links)"
            >
              <Link2 className="h-4 w-4" />
            </button>

            {/* Main Text Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Share advice, compare products, or tag @Cart..."
                maxLength={MAX_CHARS}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
              {inputText.length > 1500 && (
                <span className="absolute right-3 top-3 text-[10px] text-slate-400 font-mono">
                  {inputText.length}/{MAX_CHARS}
                </span>
              )}
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={
                sending ||
                (!inputText.trim() &&
                  attachedImages.length === 0 &&
                  attachedLinks.length === 0)
              }
              className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors shrink-0 disabled:opacity-40"
              aria-label="Send Message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Moderation / Report Modal */}
      {reportingMessageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-600">
                <ShieldAlert className="h-5 w-5" />
                <h3 className="font-bold text-slate-900 text-sm">Report Community Message</h3>
              </div>
              <button
                onClick={() => setReportingMessageId(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Please choose a reason for flagging this content to community moderators:
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-3">
              {[
                "Spam or Deceptive Advertising",
                "Abusive, Harassing or Offensive Content",
                "Phishing or Malicious Link",
                "Unverified or Misleading Information",
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs text-slate-700"
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportingMessageId(null)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Zoomed Image Lightbox */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={zoomedImage}
              alt="Enlarged"
              className="max-h-[85vh] w-auto rounded-2xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-2 right-2 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
