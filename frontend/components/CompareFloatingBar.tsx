"use client";

import Link from "next/link";
import { SlidersHorizontal, X, ArrowRight } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";

export default function CompareFloatingBar() {
  const { compareList, removeFromCompare, clearCompare } = useNovatek();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 w-full max-w-2xl px-4 animate-slide-up">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-cyan-500/40 bg-[#0c1120]/95 p-3.5 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl">
        
        {/* Left: Info & Thumbnails */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <SlidersHorizontal className="h-5 w-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Compare Matrix</span>
              <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                {compareList.length} / 4
              </span>
            </div>
            
            {/* Thumbnails preview */}
            <div className="mt-1 flex items-center gap-1.5">
              {compareList.map((product) => (
                <div
                  key={product.id}
                  className="group relative flex h-7 w-7 items-center justify-center rounded-md bg-slate-800 p-0.5"
                  title={product.name}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute -top-1 -right-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-white group-hover:flex"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearCompare}
            className="rounded-xl px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Clear
          </button>

          <Link
            href="/compare"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/30 hover:opacity-90 transition-all hover:scale-105"
          >
            <span>Compare Now</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </div>
  );
}
