import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "SmartCart AI",
  description: "Agentic shopping assistant with PayPal checkout",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        <Navigation />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
