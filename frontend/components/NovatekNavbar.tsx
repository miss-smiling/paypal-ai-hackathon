"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, ShoppingBag, User, SlidersHorizontal, Sparkles, Menu, X, ArrowRight, Globe } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";

export default function NovatekNavbar() {
  const pathname = usePathname();
  const { cartCount, compareList, setIsCartOpen, setIsSearchOpen, setIsCareModalOpen } = useNovatek();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [taglineLangIndex, setTaglineLangIndex] = useState(0);

  const multilingualTaglines = [
    { lang: "ENG", text: "Technology For Life · Upgrade Your World" },
    { lang: "HIN", text: "जीवन के लिए तकनीक · अपनी दुनिया को अपग्रेड करें" },
    { lang: "KAN", text: "ಜೀವನಕ್ಕಾಗಿ ತಂತ್ರಜ್ಞಾನ · ನಿಮ್ಮ ಜಗತ್ತನ್ನು ನವೀಕರಿಸಿ" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTaglineLangIndex((prev) => (prev + 1) % multilingualTaglines.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [multilingualTaglines.length]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const navLinks = [
    { label: "Shop", href: "/#featured-products" },
    { label: "Categories", href: "/#categories" },
    { label: "New Arrivals", href: "/#featured-products" },
    { label: "Deals", href: "/#deals" },
    {
      label: "AI Assistant",
      href: "/assistant",
      isAi: true,
      badge: "AI",
    },
    {
      label: "Compare",
      href: "/compare",
      badge: compareList.length > 0 ? String(compareList.length) : undefined,
    },
    { label: "Support", href: "#care", onClick: () => setIsCareModalOpen(true) },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#080a11]/90 backdrop-blur-xl transition-all">
      {/* Top Multilingual Announcement Ribbon */}
      <div className="border-b border-slate-800/60 bg-[#06080e] px-4 py-1.5 text-center text-[11px] text-slate-400">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="hidden sm:flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-semibold text-slate-300">SmartCart AI</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-medium">Autonomous Commerce Platform</span>
          </div>

          {/* Cycling Tagline (English, Hindi, Kannada) */}
          <div className="mx-auto sm:mx-0 flex items-center gap-2">
            <Globe className="h-3 w-3 text-cyan-400" />
            <span className="rounded bg-cyan-500/10 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300">
              {multilingualTaglines[taglineLangIndex].lang}
            </span>
            <span className="text-slate-200 font-medium transition-all duration-300">
              {multilingualTaglines[taglineLangIndex].text}
            </span>
          </div>

          {/* Languages shortcuts */}
          <div className="hidden md:flex items-center gap-1.5 text-[10px]">
            {multilingualTaglines.map((item, idx) => (
              <button
                key={item.lang}
                onClick={() => setTaglineLangIndex(idx)}
                className={`rounded px-1.5 py-0.5 transition-colors ${
                  taglineLangIndex === idx
                    ? "bg-cyan-500/20 text-cyan-300 font-bold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {item.lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-400 p-[1px] shadow-lg shadow-blue-600/30 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-blue-500/50">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#090c15]">
              {/* Geometric 'N' Icon matching NOVATEK */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 20V4l16 16V4" />
              </svg>
            </div>
          </div>
          <div>
            <span className="text-xl font-black tracking-widest text-white transition-colors group-hover:text-cyan-300">
              NOVATEK
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              SmartCart AI
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            if (link.onClick) {
              return (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
                >
                  {link.label}
                </button>
              );
            }
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "font-semibold text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {link.isAi && (
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                )}
                {link.label}
                {link.badge && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      link.isAi
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-500/50"
                        : "bg-blue-600/80 text-white"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
                {active && (
                  <span className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search tech catalog"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Compare Quick Button */}
          <Link
            href="/compare"
            aria-label="Product Comparison"
            className="relative hidden sm:flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <SlidersHorizontal className="h-5 w-5" />
            {compareList.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[11px] font-bold text-slate-950 shadow-md shadow-cyan-500/40 animate-pulse">
                {compareList.length}
              </span>
            )}
          </Link>

          {/* User Profile */}
          <Link
            href="/dashboard"
            aria-label="User Account"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <User className="h-5 w-5" />
          </Link>

          {/* Shopping Bag Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Shopping Bag"
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-110" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-md shadow-blue-500/50">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800 md:hidden"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-[#090c16]/95 px-4 py-5 backdrop-blur-2xl md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => {
              if (link.onClick) {
                return (
                  <button
                    key={link.label}
                    onClick={() => {
                      link.onClick?.();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    {link.label}
                    <ArrowRight className="h-4 w-4 text-slate-500" />
                  </button>
                );
              }
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2">
                    {link.isAi && <Sparkles className="h-4 w-4 text-cyan-400" />}
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
