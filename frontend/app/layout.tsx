import type { Metadata } from "next";
import "./globals.css";
import { SmartCartProvider } from "@/context/SmartCartContext";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "SmartCart — Intelligent Shopping & Product Comparison Platform",
  description:
    "SmartCart helps you understand what is actually worth buying. Compare products across Amazon & Flipkart, manage budgets, and save 10% when paying with PayPal on our platform.",
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
