"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Menu,
  Sparkles,
  GitCompare,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";
import { formatINR } from "@/lib/mockData";
import ThemeToggle from "@/components/ThemeToggle";

export default function Topbar() {
  const {
    sidebarCollapsed,
    setMobileMenuOpen,
    setSearchModalOpen,
    user,
    compareIds,
  } = useSmartCart();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setNotificationOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sampleNotifications = [
    {
      id: "n-1",
      title: "Price Drop Alert",
      text: "iPhone 15 dropped to ₹64,999 on Flipkart.",
      time: "2h ago",
      read: false,
      link: "/alerts",
    },
    {
      id: "n-2",
      title: "Budget Optimization",
      text: "CART identified ₹8,000 potential savings on Laptop purchases.",
      time: "5h ago",
      read: false,
      link: "/budget",
    },
    {
      id: "n-3",
      title: "Watchlist Update",
      text: "Sony WH-1000XM5 price is within ₹2,990 of your target.",
      time: "1d ago",
      read: true,
      link: "/watchlist",
    },
  ];

  return (
    <header
      className={`sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all duration-300 ${
        sidebarCollapsed ? "md:pl-20" : "md:pl-64"
      }`}
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile hamburger & Search trigger */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-xl">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/dashboard"
            className="md:hidden flex items-center gap-1.5 shrink-0 mr-1"
          >
            <img src="/logo.png" alt="SmartCart" className="h-7 w-7 object-contain" />
            <span className="text-sm font-black text-slate-900">SmartCart</span>
          </Link>

          {/* Quick Search Bar */}
          <div
            onClick={() => setSearchModalOpen(true)}
            className="flex-1 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-100 border border-slate-200/60 text-slate-400 hover:text-slate-600 cursor-pointer transition-all max-w-md shadow-2xs"
          >
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs sm:text-sm truncate">
              Search laptops, phones, reviews, specs...
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded shadow-xs ml-auto">
              <span>⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Right: Quick actions, notifications, user avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Compare Indicator button if items added */}
          {compareIds.length > 0 && (
            <Link
              href="/compare"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
            >
              <GitCompare className="h-3.5 w-3.5" />
              <span>Compare ({compareIds.length})</span>
            </Link>
          )}

          {/* Ask CART shortcut CTA */}
          <Link
            href="/assistant"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-semibold shadow-xs shadow-indigo-500/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ask CART</span>
          </Link>

          {/* Light / dark theme toggle */}
          <ThemeToggle />

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 z-50 animate-slide-up">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      Notifications
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      2 New
                    </span>
                  </div>
                  <Link
                    href="/alerts"
                    onClick={() => setNotificationOpen(false)}
                    className="text-xs text-indigo-600 hover:underline font-medium"
                  >
                    Manage Alerts
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                  {sampleNotifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => setNotificationOpen(false)}
                      className={`block py-2.5 px-2 rounded-xl transition-colors hover:bg-slate-50 ${
                        !n.read ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {n.text}
                      </p>
                    </Link>
                  ))}
                </div>

                <div className="pt-2.5 border-t border-slate-100 mt-2 text-center">
                  <Link
                    href="/history"
                    onClick={() => setNotificationOpen(false)}
                    className="text-xs text-slate-500 hover:text-indigo-600 font-medium"
                  >
                    View Shopping Activity Timeline
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-100 transition-all"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs shadow-xs">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 animate-slide-up space-y-2">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user.email}
                  </p>
                  <span className="mt-1.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Pro Buyer · Active
                  </span>
                </div>

                <div className="space-y-0.5 text-xs font-medium text-slate-700">
                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Profile & Preferences</span>
                  </Link>

                  <Link
                    href="/budget"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Budget Settings</span>
                  </Link>

                  <Link
                    href="/onboarding"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors text-indigo-600"
                  >
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    <span>Run Onboarding Wizard</span>
                  </Link>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href="/login"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
