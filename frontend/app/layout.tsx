import type { Metadata } from "next";
import "./globals.css";
import "./dark-theme.css";
import { SmartCartProvider } from "@/context/SmartCartContext";
import AppShell from "@/components/layout/AppShell";

// Runs before first paint so a saved dark theme never flashes light.
// Default is light: the UI is written with light colors and dark-theme.css
// only activates when <html class="dark"> is present.
const themeInitScript = `try{if(localStorage.getItem("smartcart_theme")==="dark"){document.documentElement.classList.add("dark")}}catch(e){}`;

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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        <SmartCartProvider>
          <AppShell>{children}</AppShell>
        </SmartCartProvider>
      </body>
    </html>
  );
}
