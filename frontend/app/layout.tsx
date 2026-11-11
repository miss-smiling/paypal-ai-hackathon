import type { Metadata } from "next";
import "./globals.css";
import { SmartCartProvider } from "@/context/SmartCartContext";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "SmartCart AI — Intelligent Shopping & Product Comparison Platform",
  description:
    "AI-powered shopping intelligence that helps you understand what is actually worth buying. Compare products across Amazon & Flipkart, manage budgets, and track price drops.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        <SmartCartProvider>
          <AppShell>{children}</AppShell>
        </SmartCartProvider>
      </body>
    </html>
  );
}
