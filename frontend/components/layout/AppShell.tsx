"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";
import SearchModal from "./SearchModal";
import RatingModal from "@/components/RatingModal";
import ToastContainer from "@/components/ui/ToastContainer";
import { useSmartCart } from "@/context/SmartCartContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sidebarCollapsed } = useSmartCart();

  // Standalone pages that don't need the main sidebar layout
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/onboarding";

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <div className="flex-1 flex flex-col justify-center">
          {children}
        </div>
        <Footer />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Top navigation */}
      <Topbar />

      {/* Main page content area */}
      <main
        className={`flex-1 transition-all duration-300 pb-12 ${
          sidebarCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </div>
      </main>

      {/* Global Footer with PayPal Hackathon notice */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        <Footer />
      </div>

      {/* Global Modals & Toasts */}
      <SearchModal />
      <RatingModal />
      <ToastContainer />
    </div>
  );
}
