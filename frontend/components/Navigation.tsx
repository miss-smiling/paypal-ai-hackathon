"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: string;
  isAction?: boolean;
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: "/icons/home.png" },
  { href: "/dashboard", label: "Dashboard", icon: "/icons/dashboard.png" },
  { href: "/assistant", label: "AI Assistant", icon: "/icons/assistant.png", badge: "AI" },
  { href: "/compare", label: "Compare", icon: "/icons/compare.png" },
  { href: "/product/1", label: "Product Details", icon: "/icons/product.png" },
  { href: "/watchlist", label: "Watchlist", icon: "/icons/watchlist.png" },
  { href: "/budget", label: "Budget Planner", icon: "/icons/budget.png" },
  { href: "/settings", label: "Settings", icon: "/icons/settings.png" },
];

const SECONDARY_NAV_ITEMS: NavItem[] = [
  { href: "/orders", label: "Orders", icon: "/icons/orders.png" },
  { href: "/checkout", label: "Checkout", icon: "/icons/checkout.png" },
  { href: "/login", label: "Login", icon: "/icons/login.png" },
  { href: "/signup", label: "Sign Up", icon: "/icons/signup.png", isAction: true },
];

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/product/")) return pathname.startsWith("/product");
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#07090e]/80 backdrop-blur-xl shadow-2xl">
      {/* Brand Header */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-2 shadow-lg shadow-cyan-500/20 transition-all group-hover:shadow-cyan-500/40">
            <Image
              src="/icons/home.png"
              alt="SmartCart AI Logo"
              width={24}
              height={24}
              className="h-full w-full object-contain brightness-0 invert"
            />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white">
              SmartCart <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
            </span>
            <span className="hidden text-[10px] font-medium text-slate-400 sm:inline-block sm:ml-2">
              Autonomous Commerce
            </span>
          </div>
        </Link>

        {/* Quick Auth / Account Actions */}
        <div className="flex items-center gap-2">
          {SECONDARY_NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 ${
                  item.isAction
                    ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 hover:opacity-90"
                    : active
                    ? "bg-cyan-500/10 text-cyan-400 font-semibold ring-1 ring-cyan-500/30 shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <div className="relative h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Image
                    src={item.icon}
                    alt={`${item.label} icon`}
                    width={16}
                    height={16}
                    className={`h-full w-full object-contain ${
                      item.isAction || active ? "brightness-0 invert filter hue-rotate-15" : "opacity-75"
                    }`}
                  />
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Horizontal Bar for all primary pages */}
      <nav
        aria-label="Main Navigation"
        className="border-t border-slate-800/60 bg-slate-950/40"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ul className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-2.5">
            {MAIN_NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    className={`group relative flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 ${
                      active
                        ? "bg-slate-900 text-cyan-400 shadow-lg ring-1 ring-cyan-500/30 font-semibold"
                        : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                    }`}
                  >
                    {/* Icon container */}
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-xl p-1 transition-all duration-200 group-hover:scale-110 ${
                        active
                          ? "bg-cyan-500/20 ring-1 ring-cyan-500/40"
                          : "bg-slate-900/80 group-hover:bg-slate-800"
                      }`}
                    >
                      <Image
                        src={item.icon}
                        alt={`${item.label} icon`}
                        width={20}
                        height={20}
                        className="h-full w-full object-contain opacity-80 group-hover:opacity-100"
                      />
                    </div>

                    {/* Label */}
                    <span className="whitespace-nowrap">{item.label}</span>

                    {/* Badge if present */}
                    {item.badge && (
                      <span className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-1.5 py-0.2 text-[9px] font-bold text-white shadow-sm">
                        {item.badge}
                      </span>
                    )}

                    {/* Active highlight indicator bar */}
                    {active && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
}
