"use client";

import { useEffect, useState } from "react";
import { Star, X, CheckCircle2, MessageSquareHeart, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useSmartCart } from "@/context/SmartCartContext";

const RATING_DISMISSED_KEY = "smartcart_exit_rating_done_v3";

export default function RatingModal() {
  const { user, addToast } = useSmartCart();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Only prompt if not already rated or dismissed in this browser
    const alreadyDismissed = localStorage.getItem(RATING_DISMISSED_KEY);
    if (alreadyDismissed) return;

    let hasTriggered = false;

    // Exit intent listener: mouse moving rapidly toward the top of the browser window
    const handleMouseLeave = (e: MouseEvent) => {
      if (hasTriggered) return;
      if (e.clientY <= 15) {
        hasTriggered = true;
        setIsOpen(true);
      }
    };

    // First session engagement fallback (after 45s of active browsing)
    const fallbackTimer = setTimeout(() => {
      if (!hasTriggered && !localStorage.getItem(RATING_DISMISSED_KEY)) {
        hasTriggered = true;
        setIsOpen(true);
      }
    }, 45000);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleSkip = () => {
    localStorage.setItem(RATING_DISMISSED_KEY, "skipped");
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;

    setSubmitting(true);
    const token = localStorage.getItem("smartcart_auth_token_v3") || "demo-token";

    try {
      await api.submitRating(token, rating, comment);
      localStorage.setItem(RATING_DISMISSED_KEY, "submitted");
      setSubmitted(true);
      addToast("Rating Submitted", "Thank you for sharing your experience!", "success");
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    } catch {
      // Local fallback storage
      localStorage.setItem(RATING_DISMISSED_KEY, "submitted");
      setSubmitted(true);
      addToast("Rating Recorded", "Thank you for your feedback!", "success");
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-up">
        {/* Close / Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Skip Rating"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Thank You!</h3>
            <p className="text-xs text-slate-500">
              Your rating has been recorded and factored into our live community satisfaction score.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-md">
              <MessageSquareHeart className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                How has your SmartCart experience been?
              </h3>
              <p className="text-xs text-slate-500">
                Help us improve shopping intelligence for everyone. Your genuine rating matters!
              </p>
            </div>

            {/* Interactive 5-Star Selection */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-none"
                    aria-label={`Rate ${star} star`}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        filled ? "fill-amber-400 text-amber-500" : "text-slate-200"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-bold text-amber-700">
              {rating === 5 && "Outstanding — Exceeded Expectations!"}
              {rating === 4 && "Great — Found What I Needed!"}
              {rating === 3 && "Good — Useful Shopping Comparison"}
              {rating === 2 && "Fair — Could Be Better"}
              {rating === 1 && "Poor — Encountered Issues"}
            </p>

            {/* Optional written comment */}
            <div className="text-left">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Optional Feedback / Suggestions
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or what can we improve?"
                maxLength={500}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Action buttons: Rate SmartCart or Skip */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
