import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { ChevronDown, LayoutDashboard, Tags, Users, LineChart as LineChartIcon } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { getServerUser } from "@/lib/session";
import { LogoutButton } from "@/components/shared/logout-button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/budget-categories", label: "Budget category", icon: Tags },
  { href: "/admin/analytics", label: "Analytics", icon: LineChartIcon },
];

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
  role: string;
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

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getServerUser();

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <main className="mx-auto flex min-h-screen items-center justify-center px-4 py-8">
          <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Admin Panel</p>
            <h1 className="mt-3 text-2xl font-semibold text-white">Access required</h1>
            <p className="mt-3 text-sm text-slate-300">Please sign in as an admin to continue.</p>
            <div className="mt-6">
              <Link
                href="/frontend/login"
                className="inline-flex items-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"
              >
                Go to login
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 border-r border-white/10 bg-white/5 p-5 lg:flex lg:flex-col">
          <Link href="/admin" className="text-xl font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <p className="mt-2 text-sm text-slate-400">Admin dashboard</p>

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
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-white lg:text-base">{APP_NAME}</p>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Admin Panel</p>
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
