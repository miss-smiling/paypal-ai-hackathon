"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  ShoppingBag,
  Store,
  Wallet,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";
import { ProductCategory, Retailer } from "@/lib/types";
import { formatINR } from "@/lib/mockData";

export default function OnboardingPage() {
  const router = useRouter();
  const { updateUser, addToast } = useSmartCart();
  const [step, setStep] = useState(1);

  // Selections
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([
    "Laptops",
    "Smartphones",
    "Audio",
  ]);
  const [selectedRetailers, setSelectedRetailers] = useState<Retailer[]>([
    "Amazon",
    "Flipkart",
  ]);
  const [budget, setBudget] = useState(150000);
  const [priorities, setPriorities] = useState<string[]>([
    "Value for Money",
    "Hardware Longevity",
  ]);

  const categoriesList: ProductCategory[] = [
    "Laptops",
    "Smartphones",
    "Audio",
    "Wearables",
    "Accessories",
    "Home Appliances",
  ];

  const retailersList: Retailer[] = [
    "Amazon",
    "Flipkart",
    "Croma",
    "Reliance Digital",
  ];

  const priorityOptions = [
    "Value for Money",
    "Verified Review Authenticity",
    "Hardware Longevity & Warranty",
    "Fast Prime/Express Delivery",
    "Lowest Absolute Price",
  ];

  const toggleCategory = (cat: ProductCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleRetailer = (ret: Retailer) => {
    setSelectedRetailers((prev) =>
      prev.includes(ret) ? prev.filter((r) => r !== ret) : [...prev, ret]
    );
  };

  const togglePriority = (p: string) => {
    setPriorities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleFinish = () => {
    updateUser({
      preferredCategories: selectedCategories,
      preferredRetailers: selectedRetailers,
      defaultBudget: budget,
      shoppingPriorities: priorities,
    });
    addToast(
      "Setup Complete!",
      "CART intelligence customized to your shopping preferences.",
      "success"
    );
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 animate-fade-in">
      <div className="saas-card p-6 sm:p-10 space-y-6 shadow-xl border border-slate-200">
        {/* Brand & Step Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>SmartCart Onboarding</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Step {step} of 4
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Categories */}
        {step === 1 && (
          <div className="space-y-5 animate-slide-up">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">
                What do you shop for most?
              </h2>
              <p className="text-xs text-slate-500">
                Select the product categories you want CART to monitor and prioritize.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {categoriesList.map((cat) => {
                const active = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`p-3.5 rounded-2xl border text-left font-semibold transition-all flex items-center justify-between ${
                      active
                        ? "bg-indigo-50 border-indigo-400 text-indigo-800 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span>{cat}</span>
                    {active && <Check className="h-4 w-4 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Retailers */}
        {step === 2 && (
          <div className="space-y-5 animate-slide-up">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">
                Which stores do you trust?
              </h2>
              <p className="text-xs text-slate-500">
                SmartCart compares prices and seller ratings across Indian e-commerce platforms.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {retailersList.map((ret) => {
                const active = selectedRetailers.includes(ret);
                return (
                  <button
                    key={ret}
                    type="button"
                    onClick={() => toggleRetailer(ret)}
                    className={`p-4 rounded-2xl border text-left font-semibold transition-all flex items-center justify-between ${
                      active
                        ? "bg-indigo-50 border-indigo-400 text-indigo-800 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="font-bold">{ret}</span>
                    {active && <Check className="h-4 w-4 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Default Budget */}
        {step === 3 && (
          <div className="space-y-5 animate-slide-up">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">
                What is your quarterly tech budget?
              </h2>
              <p className="text-xs text-slate-500">
                CART will ensure recommendations and active carts never breach this ceiling.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Selected Cap:</span>
                <span className="text-2xl font-black text-indigo-700">
                  {formatINR(budget)}
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                {[50000, 100000, 150000, 200000, 300000].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBudget(b)}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                      budget === b
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {formatINR(b)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Shopping Priorities */}
        {step === 4 && (
          <div className="space-y-5 animate-slide-up">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">
                What matters most when buying?
              </h2>
              <p className="text-xs text-slate-500">
                Our decision scoring algorithm weights your recommendations according to these factors.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              {priorityOptions.map((opt) => {
                const active = priorities.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => togglePriority(opt)}
                    className={`w-full p-3.5 rounded-2xl border text-left font-semibold transition-all flex items-center justify-between ${
                      active
                        ? "bg-indigo-50 border-indigo-400 text-indigo-800 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span>{opt}</span>
                    {active && <Check className="h-4 w-4 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Bottom Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <span>Next Step</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-xs shadow-md transition-all hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch SmartCart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
