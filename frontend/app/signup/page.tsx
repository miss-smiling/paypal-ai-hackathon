"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  KeyRound,
  Gift,
  CheckCircle2,
  Copy,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";
import { api } from "@/lib/api";
import PayPalLogo from "@/components/ui/PayPalLogo";

export default function SignupPage() {
  const router = useRouter();
  const { addToast, setIsRegistered, setAppliedCoupon, updateUser } = useSmartCart();
  const [name, setName] = useState("Sujit Krishna");
  const [email, setEmail] = useState("sujit.krishna@smartcart.ai");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("DemoPass123!");
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [couponUnlocked, setCouponUnlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Google sign in modal / state
  const [googlePhoneModal, setGooglePhoneModal] = useState(false);
  const [googlePayload, setGooglePayload] = useState<{ google_id: string; email: string; full_name: string } | null>(null);

  // 1. Send OTP to Phone
  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }
    setSendingOtp(true);
    setErrorMessage(null);
    try {
      const res = await api.sendOtp(phone.trim());
      setOtpSent(true);
      if (res.demo_otp) {
        setDemoOtpCode(res.demo_otp);
        setOtp(res.demo_otp); // Auto-fill for tester convenience
      }
      addToast("OTP Sent", res.message || `Verification code sent to ${res.phone_number}`, "success");
    } catch (err: any) {
      setErrorMessage(err.message || "Could not send OTP. Please check phone number format.");
    } finally {
      setSendingOtp(false);
    }
  };

  // 2. Register Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpSent || !otp.trim()) {
      setErrorMessage("Please send and enter your 6-digit phone verification OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.registerUser({
        email: email.trim(),
        full_name: name.trim(),
        phone_number: phone.trim(),
        otp: otp.trim(),
        password: password,
      });

      if (res.token) {
        localStorage.setItem("smartcart_auth_token_v3", res.token);
      }
      setIsRegistered(true);
      setAppliedCoupon("SMART10");
      setCouponUnlocked(true);
      updateUser({
        name: res.user.full_name,
        email: res.user.email,
        phone: res.user.phone_number,
      });

      addToast("Welcome to SmartCart!", "10% Discount Coupon (SMART10) unlocked.", "success");
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  // 3. Google Sign-In with mandatory Phone Verification
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    const demoGoogleUser = {
      google_id: "goog_auth_" + Date.now(),
      email: email.trim(),
      full_name: name.trim(),
      avatar_url: "/logo.png",
    };

    try {
      const res = await api.googleAuth(demoGoogleUser);
      if (res.status === "phone_verification_required") {
        setGooglePayload(demoGoogleUser);
        setGooglePhoneModal(true);
        addToast(
          "Phone Verification Required",
          "One verified phone number belongs to only one account. Please verify your phone number to complete Google registration.",
          "info"
        );
      } else if (res.status === "authenticated" && res.token) {
        localStorage.setItem("smartcart_auth_token_v3", res.token);
        setIsRegistered(true);
        setAppliedCoupon("SMART10");
        setCouponUnlocked(true);
        addToast("Google Sign-In Successful", "Logged in with Google.", "success");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Google authentication failed.");
    }
  };

  // Complete Google Registration with Verified Phone
  const handleGooglePhoneComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googlePayload || !otp.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.googleAuth({
        ...googlePayload,
        phone_number: phone.trim(),
        otp: otp.trim(),
      });

      if (res.status === "authenticated" && res.token) {
        localStorage.setItem("smartcart_auth_token_v3", res.token);
        setIsRegistered(true);
        setAppliedCoupon("SMART10");
        setGooglePhoneModal(false);
        setCouponUnlocked(true);
        addToast("Account Created", "Google account linked and phone verified!", "success");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to link verified phone number.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText("SMART10");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast("Coupon Copied!", "Use code SMART10 at PayPal checkout for 10% off.", "info");
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 my-6 animate-fade-in">
      <div className="saas-card p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200">
        {/* Brand & Logo */}
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
            Create Your SmartCart Account
          </h1>
          <p className="text-xs text-slate-500">
            One verified phone number = One account. Compare products &amp; save 10% with PayPal.
          </p>
        </div>

        {/* 10% Discount Incentive Banner */}
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-violet-50/60 to-blue-50/90 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                Register &amp; Get <span className="text-indigo-600 font-black">10% OFF Total Cost</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Valid on all purchases paid with PayPal on SmartCart.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/90 border border-indigo-100 p-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Coupon:</span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                SMART10
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">with</span>
              <PayPalLogo className="h-3" />
            </div>
          </div>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2.5 animate-shake">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-snug">
              <span className="font-bold">Registration Alert</span>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {couponUnlocked ? (
          <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 p-5 text-center space-y-4 animate-scale-up">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">10% PayPal Coupon Unlocked!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your verified account is active. Use this coupon code at checkout:
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
              <span className="font-mono text-base font-black tracking-widest text-indigo-600">
                SMART10
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Copy Code"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-700 shadow-md transition-all"
            >
              <span>Explore Products &amp; Compare</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
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
              <span>Sign up with Google (Phone Verified)</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-200" />
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase">
                Or Register with Phone OTP
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Full Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Email Address */}
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

              {/* Verified Phone Number (Mandatory: 1 Phone = 1 Account) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Phone Number (Mandatory Verification)
                  </label>
                  <span className="text-[10px] text-indigo-600 font-bold">1 Phone = 1 Account</span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setOtpSent(false);
                      }}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2.5 font-bold text-white transition-colors shrink-0 disabled:opacity-50"
                  >
                    {sendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                </div>
              </div>

              {/* OTP Input with Demo Helper Badge */}
              {otpSent && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-indigo-950">
                      Enter 6-Digit Verification Code
                    </label>
                    {demoOtpCode && (
                      <span className="text-[10px] bg-white border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-bold">
                        Demo OTP: {demoOtpCode}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-indigo-500" />
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="6-digit code"
                      maxLength={6}
                      className="w-full rounded-xl border border-indigo-200 pl-10 pr-4 py-2.5 text-slate-900 bg-white font-mono tracking-widest focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Password
                </label>
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 shadow-md transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Verifying &amp; Registering...</span>
                ) : (
                  <>
                    <span>Complete Registration &amp; Claim 10%</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-indigo-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Google Phone Verification Required Dialog */}
      {googlePhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Verify Phone for Google Sign-In</h3>
              <p className="text-xs text-slate-500">
                To guarantee account security, every Google login requires one unique verified phone number.
              </p>
            </div>

            <form onSubmit={handleGooglePhoneComplete} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="rounded-xl bg-indigo-600 text-white px-3 py-2 font-bold shrink-0"
                  >
                    Send OTP
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="font-semibold text-slate-700">Enter OTP</label>
                    {demoOtpCode && <span className="font-mono text-indigo-600 font-bold">Demo: {demoOtpCode}</span>}
                  </div>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-slate-900"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGooglePhoneModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !otp.trim()}
                  className="rounded-xl bg-indigo-600 text-white font-bold px-4 py-2 disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Verify & Sign In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
