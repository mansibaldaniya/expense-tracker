import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

const highlights = [
  "JWT auth with secure httpOnly cookies",
  "AI expense extraction with Gemini 1.5 Flash",
  "Dashboard analytics, budgets, and CSV export",
  "Admin panel with role-based access",
];

export default function FrontendHomePage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
      <section className="space-y-6">
        <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
          Production-ready finance automation
        </span>
        <div className="space-y-4">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            {APP_NAME}
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Track spending, extract expenses from text, monitor budgets, and give admins a clean operations view in one scalable Next.js app.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/frontend/register" className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950">
            Get started
          </Link>
          <Link href="/frontend/login" className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
            Sign in
          </Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {highlights.map((item) => (
            <li key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 backdrop-blur">
              {item}
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-950/50 p-4">
            <p className="text-sm text-slate-400">This month</p>
            <p className="mt-2 text-3xl font-semibold">₹24,180</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-950/50 p-4">
              <p className="text-sm text-slate-400">Categories</p>
              <p className="mt-2 text-2xl font-semibold">11</p>
            </div>
            <div className="rounded-2xl bg-slate-950/50 p-4">
              <p className="text-sm text-slate-400">AI imports</p>
              <p className="mt-2 text-2xl font-semibold">Fast</p>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-400/20 to-blue-400/20 p-4">
            <p className="text-sm text-slate-300">Built for Vercel deployment</p>
            <p className="mt-2 text-sm text-slate-100">
              App Router, TypeScript, MongoDB, Mongoose, Gemini AI, and role-based access control.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
