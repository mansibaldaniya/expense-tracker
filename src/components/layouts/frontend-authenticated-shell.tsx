"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { ResponsiveAppShell, type AppNavItem } from "@/components/layouts/responsive-app-shell";

const userNav: AppNavItem[] = [
  { href: "/frontend/dashboard", label: "Dashboard", iconKey: "dashboard" },
  { href: "/frontend/expenses", label: "Expenses", iconKey: "expenses" },
  { href: "/frontend/budgets", label: "Budgets", iconKey: "budgets" },
  { href: "/frontend/import", label: "AI Import", iconKey: "ai-import" },
  { href: "/frontend/settings", label: "Settings", iconKey: "settings" },
];

const adminNav: AppNavItem[] = [{ href: "/admin", label: "Admin", iconKey: "admin" }];

function UserBadge({
  name,
  role,
}: {
  name: string;
  role: "user" | "admin";
}) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/15 text-sm font-semibold text-emerald-200">
        {name
          .split(" ")
          .filter(Boolean)
          .map((part) => part[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()}
      </div>
      <div className="leading-tight">
        <p className="font-medium text-white">{name}</p>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{role}</p>
      </div>
    </div>
  );
}

export function FrontendAuthenticatedShell({
  children,
  name,
  role,
}: Readonly<{
  children: ReactNode;
  name: string;
  role: "user" | "admin";
}>) {
  const pathname = usePathname();
  const isHome = pathname === "/frontend" || pathname === "/frontend/";
  const navItems = [...userNav, ...(role === "admin" ? adminNav : [])];

  if (isHome) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/frontend" className="text-lg font-semibold tracking-tight">
              {APP_NAME}
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <UserBadge name={name} role={role} />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 lg:hidden">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 text-[10px] font-semibold text-emerald-200">
                  {name
                    .split(" ")
                    .filter(Boolean)
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <span className="max-w-28 truncate">{name}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    );
  }

  return (
    <ResponsiveAppShell
      homeHref="/frontend/dashboard"
      appLabel={APP_NAME}
      subtitle="Expense automation dashboard"
      navItems={navItems}
      userName={name}
      userRole={role}
    >
      {children}
    </ResponsiveAppShell>
  );
}
