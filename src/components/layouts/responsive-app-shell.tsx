"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  CreditCard,
  LayoutDashboard,
  LineChart as LineChartIcon,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Tags,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/shared/logout-button";
import { APP_NAME } from "@/lib/constants";

export type AppIconKey =
  | "dashboard"
  | "expenses"
  | "budgets"
  | "ai-import"
  | "settings"
  | "admin"
  | "users"
  | "budget-categories"
  | "analytics";

export type AppNavItem = {
  href: string;
  label: string;
  iconKey: AppIconKey;
};

const iconMap: Record<AppIconKey, ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  expenses: CreditCard,
  budgets: Wallet,
  "ai-import": Sparkles,
  settings: Settings,
  admin: Shield,
  users: Users,
  "budget-categories": Tags,
  analytics: LineChartIcon,
};

type ResponsiveAppShellProps = {
  children: ReactNode;
  navItems: AppNavItem[];
  appLabel?: string;
  subtitle: string;
  userName: string;
  userRole: string;
  homeHref: string;
  mainClassName?: string;
};

function NavLink({
  href,
  label,
  iconKey,
  onNavigate,
}: AppNavItem & {
  onNavigate?: () => void;
}) {
  const Icon = iconMap[iconKey];

  return (
    <Link
      href={href}
      onClick={onNavigate}
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
  compact = false,
}: {
  name: string;
  role: string;
  compact?: boolean;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (compact) {
    return (
      <div className="inline-flex max-w-[10rem] items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 text-[10px] font-semibold text-emerald-200">
          {initials}
        </div>
        <span className="truncate">{name}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/15 text-sm font-semibold text-emerald-200">
        {initials}
      </div>
      <div className="leading-tight">
        <p className="font-medium text-white">{name}</p>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{role}</p>
      </div>
    </div>
  );
}

export function ResponsiveAppShell({
  children,
  navItems,
  appLabel = APP_NAME,
  subtitle,
  userName,
  userRole,
  homeHref,
  mainClassName,
}: Readonly<ResponsiveAppShellProps>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 border-r border-white/10 bg-white/5 p-5 lg:flex lg:flex-col">
          <Link href={homeHref} className="text-xl font-semibold tracking-tight">
            {appLabel}
          </Link>
          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>

          <nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
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
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 lg:hidden"
                  aria-label="Open sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-white lg:text-base">{appLabel}</p>
                  <p className="hidden text-xs uppercase tracking-[0.28em] text-slate-400 sm:block">{subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block">
                  <UserBadge name={userName} role={userRole} />
                </div>
                <div className="sm:hidden">
                  <UserBadge name={userName} role={userRole} compact />
                </div>
              </div>
            </div>
          </header>

          <main className={cn("mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8", mainClassName)}>
            {children}
          </main>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!sidebarOpen}
      >
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={closeSidebar}
          className={cn(
            "absolute inset-0 bg-slate-950/70 transition-opacity duration-200",
            sidebarOpen ? "opacity-100" : "opacity-0"
          )}
        />

        <aside
          className={cn(
            "fixed inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col border-r border-white/10 bg-slate-950 p-5 transition-transform duration-300 ease-out will-change-transform",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link href={homeHref} className="text-xl font-semibold tracking-tight">
                {appLabel}
              </Link>
              <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={closeSidebar}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} onNavigate={closeSidebar} />
            ))}
          </nav>

          <div className="mt-6 shrink-0 border-t border-white/10 pt-6">
            <LogoutButton />
          </div>
        </aside>
      </div>
    </div>
  );
}
