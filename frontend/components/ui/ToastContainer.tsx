"use client";

import { useSmartCart } from "@/context/SmartCartContext";
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useSmartCart();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let bg = "bg-white border-slate-200 text-slate-800";
        let iconColor = "text-emerald-500";

        if (toast.type === "info") {
          Icon = Info;
          iconColor = "text-indigo-500";
        } else if (toast.type === "warning") {
          Icon = AlertTriangle;
          iconColor = "text-amber-500";
        } else if (toast.type === "error") {
          Icon = AlertCircle;
          iconColor = "text-rose-500";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border ${bg} animate-slide-up transition-all`}
          >
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-slate-900">{toast.title}</h5>
              <p className="text-xs text-slate-500 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
