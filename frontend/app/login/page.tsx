"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Lock, Mail, Phone, KeyRound, Gift, AlertCircle } from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { addToast, setIsRegistered, updateUser } = useSmartCart();
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("sujit.krishna@smartcart.ai");
  const [password, setPassword] = useState("DemoPassword123!");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!phone.trim()) return;
    setErrorMessage(null);
    try {
      const res = await api.sendOtp(phone.trim());
      setOtpSent(true);
      if (res.demo_otp) {
        setDemoOtp(res.demo_otp);
        setOtp(res.demo_otp);
      }
      addToast("OTP Sent", `Verification code sent to ${phone}`, "success");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send OTP.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload =
        loginMethod === "password"
          ? { email: email.trim(), password }
          : { phone_number: phone.trim(), otp: otp.trim() };

      const res = await api.loginUser(payload);
      if (res.token) {
        localStorage.setItem("smartcart_auth_token_v3", res.token);
      }
      setIsRegistered(true);
      updateUser({
        name: res.user.full_name,
        email: res.user.email,
        phone: res.user.phone_number,
      });

      addToast("Signed In Successfully", `Welcome back, ${res.user.full_name}!`, "success");
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials. Please verify your details.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    try {
      const demoGoogleUser = {
        google_id: "goog_demo_user",
        email: "sujit.krishna@smartcart.ai",
        full_name: "Sujit Krishna",
      };
      const res = await api.googleAuth(demoGoogleUser);
      if (res.token) {
        localStorage.setItem("smartcart_auth_token_v3", res.token);
        setIsRegistered(true);
        addToast("Google Sign-In Successful", "Signed in with Google.", "success");
        router.push("/dashboard");
      } else {
        router.push("/signup");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Google sign-in requires account registration.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 my-6 animate-fade-in">
      <div className="saas-card p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/dashboard" className="inline-flex items-center gap-2 mb-1 group">
            <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="SmartCart"
                className="h-full w-full object-contain"
              />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-slate-900">
            Sign In to SmartCart
          </h1>
          <p className="text-xs text-slate-500">
            Enter your credentials or use phone OTP to access your shopping dashboard
          </p>
        </div>

        {/* 10% Registration Callout */}
        <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-900 flex items-center gap-2.5">
          <Gift className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>
            New here?{" "}
            <Link href="/signup" className="font-bold underline hover:text-indigo-950">
              Register now
            </Link>{" "}
            to unlock your 10% discount code (SMART10) with PayPal!
          </span>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2.5 animate-shake">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-snug">
              <span className="font-bold">Sign In Error</span>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Google Sign In Quick Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 p-2.5 text-xs font-bold text-slate-700 shadow-2xs transition-all"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Method Toggle: Email/Password vs Phone/OTP */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/70 text-xs">
          <button
            type="button"
            onClick={() => setLoginMethod("password")}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              loginMethod === "password"
                ? "bg-white text-indigo-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Email &amp; Password
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod("otp")}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              loginMethod === "otp"
                ? "bg-white text-indigo-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Phone Number OTP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {loginMethod === "password" ? (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Password</label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      addToast("Password Reset", "Demo reset instruction: use DemoPassword123!", "info");
                    }}
                    className="text-[11px] text-indigo-600 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Verified Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 shrink-0 transition-colors"
                  >
                    Send OTP
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700">Enter OTP</label>
                    {demoOtp && (
                      <span className="text-[10px] text-indigo-600 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded">
                        Demo: {demoOtp}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="6-digit OTP code"
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 shadow-md transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold text-indigo-600 hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
