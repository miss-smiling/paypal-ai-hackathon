"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-2 shadow-lg shadow-cyan-500/20 mb-3">
            <span className="text-xl">🔐</span>
          </div>
          <h1 className="text-2xl font-black text-white">Welcome Back</h1>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to access saved carts, session budget, and orders.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="judge@paypalhackathon.com"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3 font-bold text-xs text-white shadow-lg shadow-cyan-500/20 hover:opacity-95"
          >
            Sign In
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase font-semibold">Or</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 px-6 py-3 font-bold text-xs text-slate-200 transition-all border border-slate-700"
        >
          <span>Continue as Guest / Judge Tester &rarr;</span>
        </Link>

        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-cyan-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
