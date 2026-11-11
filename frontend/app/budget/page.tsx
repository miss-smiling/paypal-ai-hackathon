"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Plus,
  Sparkles,
  PieChart,
  Calendar,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Filter,
  DollarSign,
  ArrowRight,
  Bot,
  X,
} from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";
import { budgetService } from "@/lib/services";
import { BudgetPlan, BudgetExpense, ProductCategory, Retailer } from "@/lib/types";
import { formatINR } from "@/lib/mockData";

export default function BudgetPlannerPage() {
  const { addToast } = useSmartCart();
  const [budget, setBudget] = useState<BudgetPlan>(budgetService.get());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);

  // Form states
  const [newBudgetTotal, setNewBudgetTotal] = useState<number>(budget.totalBudget);
  const [newBudgetName, setNewBudgetName] = useState<string>(budget.name);

  // Expense form state
  const [expName, setExpName] = useState("");
  const [expAmount, setExpAmount] = useState<number | "">("");
  const [expCat, setExpCat] = useState<ProductCategory>("Laptops");
  const [expRetailer, setExpRetailer] = useState<Retailer>("Amazon");

  useEffect(() => {
    setBudget(budgetService.get());
  }, []);

  const budgetRemaining = Math.max(0, budget.totalBudget - budget.amountSpent);
  const budgetSpentPct = Math.min(
    100,
    Math.round((budget.amountSpent / budget.totalBudget) * 100)
  );

  const filteredExpenses =
    selectedCategory === "All"
      ? budget.expenses
      : budget.expenses.filter((e) => e.category === selectedCategory);

  const handleUpdateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBudgetTotal > 0) {
      const updated = budgetService.updateTotal(newBudgetTotal, newBudgetName);
      setBudget(updated);
      setIsEditBudgetOpen(false);
      addToast("Budget Updated", `New ceiling set to ${formatINR(newBudgetTotal)}`, "success");
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expName.trim() || !expAmount || expAmount <= 0) return;

    const updated = budgetService.addExpense({
      productName: expName.trim(),
      amount: Number(expAmount),
      category: expCat,
      date: "Today",
      retailer: expRetailer,
    });
    setBudget(updated);
    setIsAddExpenseOpen(false);
    setExpName("");
    setExpAmount("");
    addToast("Expense Logged", `Added ${formatINR(Number(expAmount))} to ${expCat}`, "success");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
            <Wallet className="h-3.5 w-3.5 text-indigo-600" />
            <span>Personal Shopping Financial Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Shopping Budget Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Allocate category thresholds, track expenses across Amazon and Flipkart, and receive CART warnings before overspending.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsEditBudgetOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors"
          >
            Edit Budget Cap
          </button>
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* SECTION B: Budget Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget */}
        <div className="saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Total Budget Ceiling</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatINR(budget.totalBudget)}
          </div>
          <p className="text-[11px] text-slate-400">Target: {budget.name}</p>
        </div>

        {/* Amount Spent */}
        <div className="saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Total Spent</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatINR(budget.amountSpent)}
          </div>
          <p className="text-[11px] text-amber-600 font-medium">
            {budgetSpentPct}% of total allocation
          </p>
        </div>

        {/* Remaining Balance */}
        <div className="saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Remaining Balance</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {formatINR(budgetRemaining)}
          </div>
          <p className="text-[11px] text-slate-400">Available to allocate</p>
        </div>

        {/* Deadline & Pace */}
        <div className="saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Budget Timeline</span>
            <div className="p-1.5 rounded-lg bg-violet-50 text-violet-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1">
            Deadline: {budget.deadline || "End of Year"}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">
            On Track · 51 Days Remaining
          </p>
        </div>
      </div>

      {/* SECTION C: Category Allocation with Visual Bars */}
      <div className="saas-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Category Allocation Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Compare earmarked budgets against actual recorded transactions
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
            5 Active Categories
          </span>
        </div>

        {/* Stacked visual overview bar */}
        <div className="space-y-1.5">
          <div className="h-4 w-full rounded-full overflow-hidden bg-slate-100 flex">
            {budget.categories.map((c) => {
              const widthPct = (c.allocated / budget.totalBudget) * 100;
              return (
                <div
                  key={c.category}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
                  style={{ width: `${widthPct}%`, backgroundColor: c.color }}
                  title={`${c.category}: ${formatINR(c.allocated)}`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            {budget.categories.map((c) => (
              <div key={c.category} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span className="font-semibold text-slate-800">{c.category}</span>
                <span>({formatINR(c.allocated)})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2">
          {budget.categories.map((cat) => {
            const pct = cat.allocated > 0 ? Math.round((cat.spent / cat.allocated) * 100) : 0;
            const remaining = Math.max(0, cat.allocated - cat.spent);
            return (
              <div
                key={cat.category}
                className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{cat.category}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pct > 80
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {pct}% Spent
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Spent: {formatINR(cat.spent)}</span>
                    <span>Cap: {formatINR(cat.allocated)}</span>
                  </div>
                </div>

                <div className="text-[11px] font-semibold text-emerald-600 pt-1 border-t border-slate-100">
                  {formatINR(remaining)} left
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION E & F: Budget Insights & CART Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION E: Budget Insights */}
        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <span>Budget Optimization Insights</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Audio Budget at 95% Limit</strong>
                <span>
                  You have spent ₹18,990 of your ₹20,000 allocation. Consider deferring additional audio accessory buys.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">₹70,000 Unused Laptop Cap</strong>
                <span>
                  Your primary laptop upgrade budget is untouched and ready for upcoming festive sales.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-900 flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Healthy Discretionary Buffer</strong>
                <span>
                  Your remaining balance of {formatINR(budgetRemaining)} allows you to absorb festive discounts without overdraft.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION F: CART Budget Assistant */}
        <div className="saas-card p-6 rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/50 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                Autonomous Financial Guard
              </span>
              <h4 className="text-base font-bold text-slate-900">
                CART Budget Assistant
              </h4>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            &quot;Your planned laptop purchases currently total ₹74,990 if you choose an OLED configuration, which exceeds your target by ₹4,990. I recommend looking at the <strong>Lenovo IdeaPad Slim 3</strong> at ₹54,990 to keep ₹15,010 in your pocket without sacrificing 16GB RAM.&quot;
          </p>

          <div className="pt-2 flex items-center justify-between">
            <Link
              href="/assistant"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              <span>Ask CART to Rebalance Budget</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <span className="text-[11px] text-slate-400">
              Updated from real-time cart
            </span>
          </div>
        </div>
      </div>

      {/* SECTION D: Shopping Expenses Table */}
      <div className="saas-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recorded Shopping Expenses
            </h3>
            <p className="text-xs text-slate-500">
              All transactions deducted against your Q4 shopping budget
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Categories</option>
              <option value="Laptops">Laptops</option>
              <option value="Smartphones">Smartphones</option>
              <option value="Audio">Audio</option>
              <option value="Accessories">Accessories</option>
              <option value="Home Appliances">Home Appliances</option>
            </select>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Retailer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {exp.productName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {exp.retailer}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{exp.date}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    {formatINR(exp.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsAddExpenseOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Log New Shopping Expense
              </h3>
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Product / Item Name
                </label>
                <input
                  type="text"
                  required
                  value={expName}
                  onChange={(e) => setExpName(e.target.value)}
                  placeholder="e.g. Logitech MX Master 3S"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Amount (INR ₹)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 5800"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={expCat}
                    onChange={(e) => setExpCat(e.target.value as ProductCategory)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="Laptops">Laptops</option>
                    <option value="Smartphones">Smartphones</option>
                    <option value="Audio">Audio</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Home Appliances">Home Appliances</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Retailer
                  </label>
                  <select
                    value={expRetailer}
                    onChange={(e) => setExpRetailer(e.target.value as Retailer)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="Amazon">Amazon</option>
                    <option value="Flipkart">Flipkart</option>
                    <option value="Croma">Croma</option>
                    <option value="Reliance Digital">Reliance Digital</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Budget Total Modal */}
      {isEditBudgetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsEditBudgetOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Update Budget Plan Ceiling
              </h3>
              <button
                onClick={() => setIsEditBudgetOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBudget} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Budget Plan Name
                </label>
                <input
                  type="text"
                  required
                  value={newBudgetName}
                  onChange={(e) => setNewBudgetName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Total Budget (INR ₹)
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={newBudgetTotal}
                  onChange={(e) => setNewBudgetTotal(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditBudgetOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Save Budget Cap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
