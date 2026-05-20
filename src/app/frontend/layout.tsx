import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Info,
  LogIn,
  UserPlus,
  Wallet,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { getServerUser } from "@/lib/session";
import { LogoutButton } from "@/components/shared/logout-button";

const guestNav = [
  { href: "/frontend/about-us", label: "About Us", icon: Info },
  { href: "/frontend/login", label: "Login", icon: LogIn },
  { href: "/frontend/register", label: "Register", icon: UserPlus },
];

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

export default async function FrontendLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getServerUser();
  const isAuthed = Boolean(user);
  const isAdmin = user?.role === "admin";

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_30%),linear-gradient(180deg,_#07111f_0%,_#0b1220_55%,_#0f172a_100%)] text-white">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/frontend" className="text-lg font-semibold tracking-tight">
              {APP_NAME}
            </Link>
            <details className="group md:hidden">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm">
                <Menu className="h-4 w-4" />
              </summary>
              <nav className="absolute right-4 mt-3 flex w-60 flex-col gap-1 rounded-2xl border border-white/10 bg-slate-950 p-3 shadow-2xl">
                {guestNav.map(({ href, label, icon: Icon }) => (
                  <NavLink key={href} href={href} label={label} Icon={Icon} />
                ))}
              </nav>
            </details>
            <nav className="hidden items-center gap-2 md:flex">
              {guestNav.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    );
  }

  const navItems = [...userNav, ...(isAdmin ? adminNav : [])];

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
                        <p className="mt-1 text-base font-semibold text-white">{user.name}</p>
                        <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">{user.role}</p>
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
                  <UserBadge name={user.name} role={user.role} />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 lg:hidden">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 text-[10px] font-semibold text-emerald-200">
                    {user.name
                      .split(" ")
                      .filter(Boolean)
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <span className="max-w-28 truncate">{user.name}</span>
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
