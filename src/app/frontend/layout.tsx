import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

const navItems = [
  { href: "/frontend/dashboard", label: "Dashboard" },
  { href: "/frontend/expenses", label: "Expenses" },
  { href: "/frontend/budgets", label: "Budgets" },
  { href: "/frontend/import", label: "AI Import" },
  { href: "/frontend/settings", label: "Settings" },
];

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_30%),linear-gradient(180deg,_#07111f_0%,_#0b1220_55%,_#0f172a_100%)] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/frontend" className="text-lg font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <details className="group md:hidden">
            <summary className="cursor-pointer list-none rounded-lg border border-white/10 px-3 py-2 text-sm">
              Menu
            </summary>
            <nav className="absolute right-4 mt-3 flex w-56 flex-col gap-1 rounded-2xl border border-white/10 bg-slate-950 p-3 shadow-2xl">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
