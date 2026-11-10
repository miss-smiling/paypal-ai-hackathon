"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useNovatek();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all animate-slide-up ${
              isSuccess
                ? "border-emerald-500/40 bg-[#0a1816]/95 text-emerald-200"
                : isError
                ? "border-rose-500/40 bg-[#1d0e12]/95 text-rose-200"
                : "border-cyan-500/40 bg-[#091524]/95 text-cyan-200"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
              {isError && <AlertCircle className="h-5 w-5 text-rose-400" />}
              {!isSuccess && !isError && <Info className="h-5 w-5 text-cyan-400" />}
            </div>

            <div className="flex-1">
              <h5 className="text-xs font-bold text-white">{toast.title}</h5>
              <p className="text-[11px] opacity-90 mt-0.5">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
