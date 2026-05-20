import Link from "next/link";
import type { ReactNode } from "react";
import { APP_NAME } from "@/lib/constants";
import { getServerUser } from "@/lib/session";
import { ResponsiveAppShell } from "@/components/layouts/responsive-app-shell";

const navItems = [
  { href: "/admin", label: "Dashboard", iconKey: "dashboard" },
  { href: "/admin/users", label: "Users", iconKey: "users" },
  { href: "/admin/budget-categories", label: "Budget category", iconKey: "budget-categories" },
  { href: "/admin/analytics", label: "Analytics", iconKey: "analytics" },
];

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
    <ResponsiveAppShell
      homeHref="/admin"
      appLabel={APP_NAME}
      subtitle="Admin dashboard"
      navItems={navItems}
      userName={user.name}
      userRole={user.role}
    >
      {children}
    </ResponsiveAppShell>
  );
}
