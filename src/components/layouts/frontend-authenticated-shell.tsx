"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import {
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Wallet,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { LogoutButton } from "@/components/shared/logout-button";

const userNav = [
  { href: "/frontend/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/frontend/expenses", label: "Expenses", icon: CreditCard },
  { href: "/frontend/budgets", label: "Budgets", icon: Wallet },
  { href: "/frontend/import", label: "AI Import", icon: Sparkles },
  { href: "/frontend/settings", label: "Settings", icon: Settings },
];

const adminNav = [{ href: "/admin", label: "Admin", icon: Shield }];

function NavLink({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

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
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 border-r border-white/10 bg-white/5 p-5 lg:flex lg:flex-col">
          <Link href="/frontend/dashboard" className="text-xl font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <p className="mt-2 text-sm text-slate-400">Expense automation dashboard</p>

          <nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <NavLink key={href} href={href} label={label} Icon={Icon} />
            ))}
          </nav>

          <div className="mt-6 shrink-0 border-t border-white/10 pt-6">
            <LogoutButton />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <div className="lg:hidden">
                  <details className="group relative">
                    <summary className="flex cursor-pointer list-none items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                      <Menu className="h-5 w-5" />
                    </summary>
                    <nav className="absolute left-4 right-4 top-16 flex flex-col gap-1 rounded-3xl border border-white/10 bg-slate-950 p-3 shadow-2xl sm:left-6 sm:right-auto sm:w-72">
                      <div className="mb-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Account</p>
                        <p className="mt-1 text-base font-semibold text-white">{name}</p>
                        <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">{role}</p>
                      </div>
                      {navItems.map(({ href, label, icon: Icon }) => (
                        <NavLink key={href} href={href} label={label} Icon={Icon} />
                      ))}
                      <div className="mt-2 border-t border-white/10 pt-3">
                        <LogoutButton />
                      </div>
                    </nav>
                  </details>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-white lg:text-base">{APP_NAME}</p>
                </div>
              </div>

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

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
