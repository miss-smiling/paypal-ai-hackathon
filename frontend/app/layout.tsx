import type { Metadata } from "next";
import "./globals.css";
import { NovatekProvider } from "@/context/NovatekContext";
import NovatekNavbar from "@/components/NovatekNavbar";
import NovatekFooter from "@/components/NovatekFooter";
import CartDrawer from "@/components/CartDrawer";
import CompareFloatingBar from "@/components/CompareFloatingBar";
import QuickViewModal from "@/components/QuickViewModal";
import SearchModal from "@/components/SearchModal";
import NovatekCareModal from "@/components/NovatekCareModal";
import NovaAIFloatingWidget from "@/components/NovaAIFloatingWidget";
import ToastContainer from "@/components/ToastContainer";

export const metadata: Metadata = {
  title: "SmartCart — Better Tech. Brighter Tomorrow. | Autonomous Multi-Agent Commerce",
  description:
    "Upgrade your world with SmartCart AI. Discover flagship smartphones (iPhone 16 Pro, Galaxy S24, Pixel 9), real-time spec comparisons, and PayPal checkout.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#070a14] font-sans text-slate-100 antialiased flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
        
        {/* Ambient Dark Neon Gradients */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.12),rgba(255,255,255,0))]" />
        <div className="fixed top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[140px]" />
        <div className="fixed top-1/3 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[140px]" />

        <NovatekProvider>
          {/* Navigation Bar */}
          <NovatekNavbar />

          {/* Main Content Area */}
          <main className="flex-1 w-full">{children}</main>

          {/* Persistent Floating & Drawer Components */}
          <CartDrawer />
          <CompareFloatingBar />
          <QuickViewModal />
          <SearchModal />
          <NovatekCareModal />
          <NovaAIFloatingWidget />
          <ToastContainer />

          {/* Footer */}
          <NovatekFooter />
        </NovatekProvider>

      </body>
    </html>
  );
}
