"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { BadgeAlert, ChartColumn, CircleDollarSign, Users } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";
import { MonthPicker } from "@/components/shared/month-picker";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import type { ApiResponse } from "@/types";

type AdminSummary = {
  totalUsers: number;
  totalExpenses: number;
  totalBudgets: number;
  totalBudgetAlerts: number;
  monthlyUsers: Array<{ month: string; total: number }>;
  monthlyExpenses: Array<{ month: string; total: number }>;
  categoryBreakdown: Array<{ name: string; value: number }>;
  budgetAlerts: Array<{
    budgetId: string;
    category: string;
    spent: number;
    limit: number;
    percent: number;
    status: "safe" | "warning" | "danger";
  }>;
};

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  accentClassName: string;
};

const palette = ["#34d399", "#60a5fa", "#f59e0b", "#f87171", "#a78bfa", "#22d3ee"];

function MetricCard({ title, value, description, icon: Icon, accentClassName }: MetricCardProps) {
  return (
    <Card className="relative flex h-full min-h-[15rem] flex-col overflow-hidden p-6">
      <div className={`absolute inset-x-0 top-0 h-1 ${accentClassName}`} />
      <div className="flex h-full items-start justify-between gap-4">
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
  );
}

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      setLoading(true);
      const response = await fetch(`/api/admin/summary?month=${selectedMonth}`, { cache: "no-store" });
      const payload = (await response.json()) as ApiResponse<AdminSummary>;

      if (!response.ok) {
        toast.error(payload.message ?? "Unable to load analytics");
        if (active) {
          setLoading(false);
        }
        return;
      }

      if (active) {
        setSummary(payload.data);
        setLoading(false);
      }
    }

    void loadSummary();

    return () => {
      active = false;
    };
  }, [selectedMonth]);

  const trendComparison = useMemo(() => {
    const users = summary?.monthlyUsers ?? [];
    const expenses = summary?.monthlyExpenses ?? [];
    return users.map((item, index) => ({
      month: item.month,
      users: item.total,
      expenses: expenses[index]?.total ?? 0,
    }));
  }, [summary]);

  const alertBreakdown = useMemo(() => {
    const counts = { safe: 0, warning: 0, danger: 0 };
    (summary?.budgetAlerts ?? []).forEach((item) => {
      counts[item.status] += 1;
    });
    return [
      { name: "Safe", value: counts.safe },
      { name: "Watch", value: counts.warning },
      { name: "Alert", value: counts.danger },
    ].filter((item) => item.value > 0);
  }, [summary]);

  const categoryRows = useMemo(() => {
    return [...(summary?.categoryBreakdown ?? [])]
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [summary]);

  const topCategory = summary?.categoryBreakdown?.[0];
  const alertRate = summary && summary.totalBudgets > 0 ? Math.round((summary.totalBudgetAlerts / summary.totalBudgets) * 100) : 0;
  const expensePerBudget = summary && summary.totalBudgets > 0 ? summary.totalExpenses / summary.totalBudgets : 0;
  const userPeak = summary ? Math.max(...summary.monthlyUsers.map((item) => item.total), 0) : 0;

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <ChartColumn className="h-5 w-5 text-emerald-300" />
            <h1 className="text-3xl font-semibold text-white">Analytics</h1>
          </div>
            <p className="mt-3 text-sm text-slate-400">
              This page focuses on comparisons, concentration, and health signals. It keeps the overview page for
              totals and cards, while this view shows how the system is behaving over time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <MonthPicker value={selectedMonth} onChange={setSelectedMonth} compact />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Alert rate"
          value={`${alertRate}%`}
          description="Share of budgets in warning or danger."
          icon={BadgeAlert}
          accentClassName="bg-amber-400"
        />
        <MetricCard
          title="Expense per budget"
          value={expensePerBudget.toFixed(1)}
          description="Total expense entries compared to active budgets."
          icon={CircleDollarSign}
          accentClassName="bg-blue-400"
        />
        <MetricCard
          title="Peak user month"
          value={String(userPeak)}
          description="Highest registered user count in a month."
          icon={Users}
          accentClassName="bg-violet-400"
        />
        <MetricCard
          title="Top category"
          value={topCategory?.name ?? "None"}
          description={topCategory ? `${topCategory.value.toLocaleString()} total spend` : "No category data yet"}
          icon={ChartColumn}
          accentClassName="bg-emerald-400"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Users vs expenses</h2>
              <p className="mt-1 text-sm text-slate-400">
                Monthly non-admin user growth and platform spend for the current year.
              </p>
            </div>
          </div>
          <div className="mt-5 h-80">
            {loading ? (
              <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-sm text-slate-400">
                Loading analytics...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="month" stroke="#94a3b8" tickMargin={12} interval={0} />
                  <YAxis stroke="#94a3b8" tickMargin={12} />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      background: "#020617",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 16,
                      color: "#fff",
                    }}
                  />
                  <Line type="monotone" dataKey="users" stroke="#34d399" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="expenses" stroke="#60a5fa" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Budget health mix</h2>
              <p className="mt-1 text-sm text-slate-400">Safe, watch, and alert distribution for the selected month.</p>
            </div>
          </div>
          <div className="mt-5 h-80">
            {loading ? (
              <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-sm text-slate-400">
                Loading status mix...
              </div>
            ) : alertBreakdown.length === 0 ? (
              <EmptyState className="h-full min-h-0 bg-transparent" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={alertBreakdown} dataKey="value" nameKey="name" innerRadius={72} outerRadius={110} paddingAngle={4}>
                    {alertBreakdown.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={index === 0 ? "#34d399" : index === 1 ? "#f59e0b" : "#f87171"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Top categories</h2>
              <p className="mt-1 text-sm text-slate-400">Largest expense categories for the selected month.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="flex min-h-[16rem] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-sm text-slate-400">
                Loading categories...
              </div>
            ) : categoryRows.length === 0 ? (
              <EmptyState className="min-h-[16rem] bg-transparent" />
            ) : (
              categoryRows.map((item, index) => {
                const maxValue = categoryRows[0]?.value || 1;
                const width = Math.max(8, (item.value / maxValue) * 100);
                return (
                  <div key={item.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="mt-1 text-sm text-slate-400">{item.value.toLocaleString()} total spend</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-200">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full" style={{ width: `${width}%`, backgroundColor: palette[index % palette.length] }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Monthly signal notes</h2>
              <p className="mt-1 text-sm text-slate-400">Quick read on the selected month without repeating overview cards.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              {
                label: "Users",
                value: summary?.totalUsers ?? 0,
                hint: "Non-admin account base",
              },
              {
                label: "Expenses",
                value: summary?.totalExpenses ?? 0,
                hint: "All expense entries",
              },
              {
                label: "Budgets",
                value: summary?.totalBudgets ?? 0,
                hint: "Active budget count",
              },
              {
                label: "Alerts",
                value: summary?.totalBudgetAlerts ?? 0,
                hint: "Needs attention",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.value.toLocaleString()}</p>
                <p className="mt-1 text-sm text-slate-400">{item.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-sm text-slate-300">
              This analytics page is intentionally different from the overview page: it focuses on relationships,
              trends, and severity signals rather than repeating the top-line admin totals.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
