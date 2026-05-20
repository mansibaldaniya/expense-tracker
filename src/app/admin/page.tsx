"use client";

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { BadgeAlert, Banknote, ChartColumnBig, LineChart as LineChartIcon, Users, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import {
  Cell,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/shared/empty-state";
import { MonthPicker } from "@/components/shared/month-picker";
import { Card } from "@/components/ui/card";
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
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>;
  recentExpenses: Array<{
    id: string;
    amount: number;
    category: string;
    note: string;
  }>;
};

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accentClassName,
}: {
  title: string;
  value: number;
  description: string;
  icon: ComponentType<{ className?: string }>;
  accentClassName: string;
}) {
  return (
    <Card className="relative overflow-hidden p-6">
      <div className={`absolute inset-x-0 top-0 h-1 ${accentClassName}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value.toLocaleString()}</p>
          <p className="mt-2 text-sm text-slate-400">{description}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </Card>
  );
}

function ChartCard({
  title,
  description,
  icon: Icon,
  rightSlot,
  children,
  heightClass = "h-80",
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  rightSlot?: ReactNode;
  children: ReactNode;
  heightClass?: string;
}) {
  return (
    <Card className="min-w-0 overflow-hidden p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-emerald-300" />
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>
          <p className="mt-2 text-sm text-slate-400">{description}</p>
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
      <div className={`mt-5 min-w-0 ${heightClass}`}>{children}</div>
    </Card>
  );
}

function chartTooltipStyle() {
  return {
    contentStyle: {
      background: "#020617",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 16,
      color: "#fff",
    },
    cursor: false as const,
  };
}

const categoryPalette = ["#34d399", "#60a5fa", "#f59e0b", "#f87171", "#a78bfa", "#22d3ee"];

export default function AdminHomePage() {
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
        toast.error(payload.message ?? "Unable to load admin summary");
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

  const userTrend = summary?.monthlyUsers ?? [];
  const expenseTrend = summary?.monthlyExpenses ?? [];
  const budgetAlertChart = useMemo(
    () =>
      (summary?.categoryBreakdown ?? []).map((item) => ({
        name: item.name,
        value: item.value,
      }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value),
    [summary?.categoryBreakdown]
  );
  const budgetAlertCards = useMemo(
    () =>
      (() => {
        const statusRank = (status: "safe" | "warning" | "danger") => (status === "danger" ? 2 : status === "warning" ? 1 : 0);
        const scored = (summary?.budgetAlerts ?? [])
          .map((item) => ({
            budgetId: item.budgetId,
            category: item.category,
            percent: Math.round(item.percent),
            status: item.status,
            spent: item.spent,
            limit: item.limit,
          }))
          .sort((a, b) => {
            const statusDiff = statusRank(b.status) - statusRank(a.status);
            if (statusDiff !== 0) return statusDiff;
            return b.percent - a.percent;
          });

        const alerted = scored.filter((item) => item.status !== "safe");
        const safe = scored.filter((item) => item.status === "safe");
        return [...alerted.slice(0, 2), ...safe].slice(0, 2);
      })(),
    [summary?.budgetAlerts]
  );

  const isEmptyDashboard =
    !loading && userTrend.length === 0 && expenseTrend.length === 0 && budgetAlertCards.length === 0;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total users"
          value={summary?.totalUsers ?? 0}
          description="Non-admin users across the platform."
          icon={Users}
          accentClassName="bg-emerald-400"
        />
        <MetricCard
          title="Total expense"
          value={summary?.totalExpenses ?? 0}
          description="All expense entries recorded."
          icon={Banknote}
          accentClassName="bg-blue-400"
        />
        <MetricCard
          title="Total budget"
          value={summary?.totalBudgets ?? 0}
          description="Active budgets configured by users."
          icon={Wallet}
          accentClassName="bg-violet-400"
        />
        <MetricCard
          title="Budget alerts"
          value={summary?.totalBudgetAlerts ?? 0}
          description="Budgets in warning or danger state."
          icon={BadgeAlert}
          accentClassName="bg-amber-400"
        />
      </div>

      <div className="space-y-6">
        <ChartCard
          title="User growth"
          description="Registered non-admin users from January to December of the current year."
          icon={ChartColumnBig}
        >
          {loading ? (
            <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-sm text-slate-400">
              Loading user chart...
            </div>
          ) : userTrend.length === 0 ? (
            <EmptyState className="h-full min-h-0 bg-transparent" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userTrend} barCategoryGap="24%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" stroke="#94a3b8" tickMargin={12} interval={0} />
                <YAxis stroke="#94a3b8" tickMargin={12} allowDecimals={false} />
                <Tooltip {...chartTooltipStyle()} />
                <Bar dataKey="total" radius={[12, 12, 0, 0]} fill="#34d399" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Expense trend"
          description="Total expense value from January to December of the current year."
          icon={LineChartIcon}
        >
          {loading ? (
            <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-sm text-slate-400">
              Loading expense chart...
            </div>
          ) : expenseTrend.length === 0 ? (
            <EmptyState className="h-full min-h-0 bg-transparent" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={expenseTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" stroke="#94a3b8" tickMargin={12} interval={0} />
                <YAxis stroke="#94a3b8" tickMargin={12} />
                <Tooltip {...chartTooltipStyle()} />
                <Line type="monotone" dataKey="total" stroke="#60a5fa" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Monthly budget overview"
          description="Selected month category chart and budget alerts, shown the same way as the frontend dashboard."
          icon={BadgeAlert}
          rightSlot={<MonthPicker value={selectedMonth} onChange={setSelectedMonth} compact />}
          heightClass="h-[30rem]"
        >
          {loading ? (
            <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-sm text-slate-400">
              Loading budget alerts...
            </div>
          ) : (
            <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[1fr_0.95fr]">
              <div className="min-h-0 min-w-0 rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                {budgetAlertChart.length === 0 ? (
                  <EmptyState className="h-full min-h-0 bg-transparent" />
                ) : (
                  <div className="flex h-full flex-col gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">Category chart</h4>
                      <p className="mt-1 text-sm text-slate-400">Budget spending by category</p>
                    </div>
                    <div className="min-h-0 flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={budgetAlertChart}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={68}
                            outerRadius={118}
                            paddingAngle={4}
                            cx="50%"
                            cy="50%"
                          >
                            {budgetAlertChart.map((entry, index) => (
                              <Cell key={entry.name} fill={categoryPalette[index % categoryPalette.length]} />
                            ))}
                          </Pie>
                          <Tooltip {...chartTooltipStyle()} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              <div className="min-h-0 min-w-0 rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                {budgetAlertCards.length === 0 ? (
                  <EmptyState className="h-full min-h-0 bg-transparent" />
                ) : (
                  <div className="flex h-full flex-col gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">Budget alerts</h4>
                      <p className="mt-1 text-sm text-slate-400">Needs attention</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      {budgetAlertCards.map((item) => (
                        <div key={item.budgetId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <h5 className="text-base font-semibold text-white">{item.category}</h5>
                            <span className="text-sm text-slate-300">{Math.round(item.percent)}%</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-400">
                            Rs. {item.spent.toFixed(2)} / Rs. {item.limit.toFixed(2)}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                            {item.status === "danger" ? "Alert" : item.status === "warning" ? "Watch" : "Normal"}
                          </p>
                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, Math.max(0, item.percent))}%`,
                                backgroundColor:
                                  item.status === "danger"
                                    ? "#f87171"
                                    : item.status === "warning"
                                      ? "#f59e0b"
                                      : "#34d399",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {isEmptyDashboard ? null : (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Recent users</h2>
                <p className="mt-1 text-sm text-slate-400">Latest non-admin signups.</p>
              </div>
              <Users className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(summary?.recentUsers ?? []).map((user) => (
                <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Recent expenses</h2>
                <p className="mt-1 text-sm text-slate-400">Latest expense records from all users.</p>
              </div>
              <Banknote className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 space-y-3">
              {(summary?.recentExpenses ?? []).map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{expense.category}</p>
                    <p className="text-sm text-slate-400">{expense.note || "-"}</p>
                  </div>
                  <p className="font-semibold text-white">Rs. {expense.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </section>
  );
}
