import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartCart AI — Autonomous Shopping Engine",
  description: "Agentic shopping assistant with intelligent product verification and PayPal checkout",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07090e] font-sans text-slate-100 antialiased">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        <div className="fixed top-0 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="fixed top-1/3 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[120px]" />
        {children}
      </body>
    </html>
  );
}
