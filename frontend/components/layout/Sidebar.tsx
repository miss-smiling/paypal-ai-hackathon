"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  GitCompare,
  Wallet,
  Heart,
  Bell,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  LogOut,
  X,
  ExternalLink,
} from "lucide-react";
import { useSmartCart } from "@/context/SmartCartContext";

export default function Sidebar() {
  const pathname = usePathname();
  const {
    sidebarCollapsed,
    toggleSidebar,
    mobileMenuOpen,
    setMobileMenuOpen,
    watchlistCount,
    alertCount,
    user,
  } = useSmartCart();

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard" || pathname === "/",
    },
    {
      label: "AI Assistant",
      href: "/assistant",
      icon: Bot,
      active: pathname === "/assistant",
      badge: "CART",
      badgeColor: "bg-indigo-100 text-indigo-700",
    },
    {
      label: "Compare Products",
      href: "/compare",
      icon: GitCompare,
      active: pathname === "/compare",
    },
    {
      label: "Budget Planner",
      href: "/budget",
      icon: Wallet,
      active: pathname === "/budget",
    },
    {
      label: "Watchlist",
      href: "/watchlist",
      icon: Heart,
      active: pathname === "/watchlist",
      count: watchlistCount,
    },
    {
      label: "Price Alerts",
      href: "/alerts",
      icon: Bell,
      active: pathname === "/alerts",
      count: alertCount,
    },
    {
      label: "Shopping History",
      href: "/history",
      icon: Clock,
      active: pathname === "/history",
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between">
      {/* Top Header & Brand */}
      <div>
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/80">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 group overflow-hidden"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  SmartCart <span className="text-indigo-600 font-black">AI</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Shopping Intelligence
                </span>
              </div>
            )}
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative ${
                  item.active
                    ? "bg-indigo-50 text-indigo-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                } ${sidebarCollapsed ? "justify-center" : ""}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {item.active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r-full" />
                )}
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors ${
                    item.active
                      ? "text-indigo-600"
                      : "text-slate-400 group-hover:text-slate-700"
                  }`}
                />
                {!sidebarCollapsed && (
                  <>
                    <span className="truncate flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {typeof item.count === "number" && item.count > 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-slate-200">
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="p-3 border-t border-slate-200/80 space-y-2">
        {/* Quick Links */}
        {!sidebarCollapsed && (
          <div className="px-2 py-1 flex items-center justify-between text-xs text-slate-400">
            <Link
              href="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              <span>Onboarding Wizard</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              href="/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Help</span>
            </Link>
          </div>
        )}

        {/* User Mini Card */}
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200/60 ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs shadow-xs">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            </div>
          )}
          {!sidebarCollapsed && (
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200/60 transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <div className="hidden md:flex justify-end pt-1">
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-30 bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-50 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
