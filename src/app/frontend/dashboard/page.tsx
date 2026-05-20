"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { BadgeAlert, Banknote, Wallet, ChartColumnBig } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardCharts } from "@/components/charts/dashboard-charts";
import { Card } from "@/components/ui/card";
import type { ApiResponse } from "@/types";

type DashboardData = {
  summary: {
    totalSpendingThisMonth: number;
    totalExpenseAmount: number;
    totalExpenses: number;
    highestCategory: string;
    totalBudgets: number;
    budgetAlerts: number;
  };
  recentExpenses: Array<{
    id: string;
    amount: number;
    category: string;
    date: string;
    note: string;
  }>;
  categoryBreakdown: Array<{
    name: string;
    value: number;
  }>;
  trend: Array<{
    month: string;
    total: number;
  }>;
  budgetAlerts: Array<{
    budgetId: string;
    category: string;
    spent: number;
    limit: number;
    percent: number;
    status: "safe" | "warning" | "danger";
  }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      const payload = (await response.json()) as ApiResponse<DashboardData>;

      if (!response.ok) {
        toast.error(payload.message ?? "Unable to load dashboard");
        return;
      }

      setData(payload.data);
    }

    void loadDashboard();
  }, []);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total expense"
          value={`Rs. ${data?.summary.totalExpenseAmount.toFixed(2) ?? "0.00"}`}
          description="All expense entries recorded."
          icon={Banknote}
          accentClassName="bg-emerald-400"
          href="/frontend/expenses"
        />
        <MetricCard
          title="Expenses"
          value={String(data?.summary.totalExpenses ?? 0)}
          description="Total expense records."
          icon={ChartColumnBig}
          accentClassName="bg-blue-400"
          href="/frontend/expenses"
        />
        <MetricCard
          title="Budgets"
          value={String(data?.summary.totalBudgets ?? 0)}
          description="Active monthly budgets."
          icon={Wallet}
          accentClassName="bg-violet-400"
          href="/frontend/budgets"
        />
        <MetricCard
          title="Budget alerts"
          value={String(data?.summary.budgetAlerts ?? 0)}
          description="Budgets in warning or danger state."
          icon={BadgeAlert}
          accentClassName="bg-amber-400"
          href="/frontend/budgets"
        />
      </div>

      <div className="min-w-0">
        <DashboardCharts
          initialMonthBreakdown={data?.categoryBreakdown ?? []}
          trendData={data?.trend ?? []}
        />
      </div>
    </section>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accentClassName,
  href,
}: {
  title: string;
  value: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  accentClassName: string;
  href: string;
}) {
  return (
    <Link href={href} className="block outline-none focus-visible:outline-none">
      <Card className="relative overflow-hidden p-6 transition-transform duration-200 hover:-translate-y-0.5 hover:border-white/15">
        <div className={`absolute inset-x-0 top-0 h-1 ${accentClassName}`} />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{title}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
            <p className="mt-2 text-sm text-slate-400">{description}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
