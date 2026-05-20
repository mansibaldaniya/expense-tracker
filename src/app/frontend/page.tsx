"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { EmptyState } from "@/components/shared/empty-state";
import type { ApiResponse } from "@/types";

type PublicOverview = {
  totals: {
    users: number;
    expenses: number;
    budgets: number;
  };
  recentExpenses: Array<{
    id: string;
    category: string;
    amount: number;
    date: string;
  }>;
};

export default function FrontendHomePage() {
  const [overview, setOverview] = useState<PublicOverview | null>(null);

  useEffect(() => {
    async function loadOverview() {
      const response = await fetch("/api/public/overview", { cache: "no-store" });
      const data = (await response.json()) as ApiResponse<PublicOverview>;
      if (response.ok) {
        setOverview(data.data);
      }
    }

    void loadOverview();
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <section className="space-y-6">
        <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
          Finance automation for modern teams
        </span>
        <div className="space-y-4">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            {APP_NAME}
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            A secure, AI-powered expense tracker with authentication, budgets, analytics, and admin control.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/frontend/register" className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950">
            Register
          </Link>
          <Link href="/frontend/login" className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
            Login
          </Link>
          <Link href="/frontend/about-us" className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
            About Us
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Users", overview?.totals.users ?? 0],
            ["Expenses", overview?.totals.expenses ?? 0],
            ["Budgets", overview?.totals.budgets ?? 0],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur">
              <p className="text-sm text-slate-400">{label as string}</p>
              <p className="mt-2 text-2xl font-semibold">{value as number}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {((overview?.recentExpenses ?? []).length === 0) ? (
          <EmptyState className="min-h-[18rem]" />
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
            <div className="rounded-2xl bg-slate-950/50 p-4">
              <p className="text-sm text-slate-400">Recent expense activity</p>
              <div className="mt-4 space-y-3">
                {overview?.recentExpenses.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <div>
                      <p className="font-medium">{item.category}</p>
                      <p className="text-xs text-slate-400">{new Date(item.date).toISOString().slice(0, 10)}</p>
                    </div>
                    <p className="font-semibold">Rs. {item.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-blue-400/20 p-4">
              <p className="text-sm text-slate-300">Dynamic data from MongoDB</p>
              <p className="mt-2 text-sm leading-6 text-slate-100">
                This landing page pulls live counts from the public overview API instead of using static content.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
