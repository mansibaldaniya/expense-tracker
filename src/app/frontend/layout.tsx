import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { Info, LogIn, Menu, UserPlus } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { getServerUser } from "@/lib/session";
import { FrontendAuthenticatedShell } from "@/components/layouts/frontend-authenticated-shell";

const guestNav = [
  { href: "/frontend/about-us", label: "About Us", icon: Info },
  { href: "/frontend/login", label: "Login", icon: LogIn },
  { href: "/frontend/register", label: "Register", icon: UserPlus },
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

export default async function FrontendLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getServerUser();
  const isAuthed = Boolean(user);

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

  return <FrontendAuthenticatedShell name={user.name} role={user.role}>{children}</FrontendAuthenticatedShell>;
}
