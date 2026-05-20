import type { Metadata } from "next";
import "./globals.css";
import { ToasterProvider } from "@/components/shared/toaster-provider";

export const metadata: Metadata = {
  title: "AI Expense Tracker",
  description: "Production-ready full-stack expense tracker with AI extraction, budgets, and analytics.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
