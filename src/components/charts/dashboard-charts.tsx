"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ApiResponse } from "@/types";
import { MonthPicker } from "@/components/shared/month-picker";
import { EmptyState } from "@/components/shared/empty-state";

const palette = ["#34d399", "#60a5fa", "#f59e0b", "#f87171", "#a78bfa", "#22d3ee"];
const monthTickStyle = {
  fill: "#94a3b8",
  fontSize: 11,
};

type PiePoint = { name: string; value: number };
type TrendPoint = { month: string; total: number };
type BudgetItem = {
  id: string;
  category: string;
  limit: number;
  month: string;
  year: number;
};
type ExpenseItem = {
  id: string;
  amount: number;
  category: string;
  date: string;
  note: string;
};

type DashboardChartsProps = {
  initialMonthBreakdown: PiePoint[];
  trendData: TrendPoint[];
};

function ChartCard({
  title,
  description,
  rightSlot,
  children,
}: {
  title: string;
  description?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
      <div className="mt-6 min-w-0">{children}</div>
    </Card>
  );
}

function groupExpensesByCategory(items: ExpenseItem[]): PiePoint[] {
  const totals = new Map<string, number>();
  items.forEach((item) => {
    totals.set(item.category, (totals.get(item.category) ?? 0) + item.amount);
  });

  return [...totals.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function getAlertStatus(percent: number): "safe" | "warning" | "danger" {
  if (percent >= 100) return "danger";
  if (percent >= 80) return "warning";
  return "safe";
}

function formatMonthTick(value: string) {
  return value.length > 3 ? value.slice(0, 3) : value;
}

export function DashboardCharts({ initialMonthBreakdown, trendData }: DashboardChartsProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [breakdown, setBreakdown] = useState<PiePoint[]>(initialMonthBreakdown);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [loadingBudgets, setLoadingBudgets] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (active) setLoadingBreakdown(true);
    }, 0);

    void (async () => {
      const response = await fetch(`/api/expenses?month=${selectedMonth}&page=1&limit=100`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as ApiResponse<{
        items: ExpenseItem[];
      }>;

      if (!response.ok) {
        if (active) setLoadingBreakdown(false);
        return;
      }

      if (active) {
        setBreakdown(groupExpensesByCategory(payload.data.items ?? []));
        setLoadingBreakdown(false);
      }
    })();

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [selectedMonth]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (active) setLoadingBudgets(true);
    }, 0);

    void (async () => {
      const response = await fetch("/api/budgets", { cache: "no-store" });
      const payload = (await response.json()) as ApiResponse<{
        budgets: BudgetItem[];
      }>;

      if (!response.ok) {
        if (active) setLoadingBudgets(false);
        return;
      }

      if (active) {
        setBudgets(payload.data.budgets ?? []);
        setLoadingBudgets(false);
      }
    })();

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const monthlyBudgets = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const monthTotals = new Map(breakdown.map((item) => [item.name, item.value]));

    return budgets
      .filter((budget) => budget.year === year && Number(budget.month.slice(5, 7)) === month)
      .map((budget) => {
        const spent = monthTotals.get(budget.category) ?? 0;
        const percent = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
        return {
          budgetId: budget.id,
          category: budget.category,
          spent,
          limit: budget.limit,
          percent,
          status: getAlertStatus(percent),
        };
      })
      .sort((a, b) => {
        const rank = (status: "safe" | "warning" | "danger") => (status === "danger" ? 2 : status === "warning" ? 1 : 0);
        const diff = rank(b.status) - rank(a.status);
        if (diff !== 0) return diff;
        return b.percent - a.percent;
      });
  }, [budgets, breakdown, selectedMonth]);

  const topBudgetAlerts = monthlyBudgets.slice(0, 2);

  return (
    <div className="space-y-6">
      <ChartCard title="Current year spending" description="Month-by-month totals from January to December.">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} barCategoryGap="24%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                tick={monthTickStyle}
                tickMargin={10}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={42}
                minTickGap={0}
                tickFormatter={formatMonthTick}
              />
              <YAxis stroke="#94a3b8" tickMargin={10} tick={monthTickStyle} width={36} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  background: "#020617",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  color: "#fff",
                }}
              />
              <Bar dataKey="total" radius={[12, 12, 0, 0]} fill="#34d399" maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard
        title="Monthly budget overview"
        description="Selected month category chart and budget alerts, shown the same way as the frontend dashboard."
        rightSlot={<MonthPicker value={selectedMonth} onChange={setSelectedMonth} compact />}
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-white">Category chart</h4>
              <p className="mt-1 text-sm text-slate-400">Budget spending by category</p>
            </div>
            <div className="h-[22rem] min-h-0">
              {loadingBreakdown ? (
                <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-sm text-slate-400">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading category data...
                </div>
              ) : breakdown.length === 0 ? (
                <EmptyState className="h-full min-h-0 bg-transparent" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>
                      {breakdown.map((entry, index) => (
                        <Cell key={entry.name} fill={palette[index % palette.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-white">Budget alerts</h4>
              <p className="mt-1 text-sm text-slate-400">Needs attention</p>
            </div>
            <div className="space-y-3">
              {loadingBudgets ? (
                <div className="flex min-h-[12rem] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-sm text-slate-400">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading budget alerts...
                </div>
              ) : topBudgetAlerts.length === 0 ? (
                <EmptyState className="min-h-[12rem] bg-transparent" />
              ) : (
                topBudgetAlerts.map((item) => (
                  <div key={item.budgetId} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h5 className="text-base font-semibold text-white">{item.category}</h5>
                      <span className="text-sm text-slate-300">{Math.round(item.percent)}%</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">
                      Rs. {item.spent.toFixed(2)} / Rs. {item.limit.toFixed(2)}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                      {item.status === "danger" ? "Alert" : item.status === "warning" ? "Watch" : "Normal"}
                    </p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(item.percent, 100)}%`,
                          backgroundColor:
                            item.status === "danger"
                              ? "#fb7185"
                              : item.status === "warning"
                                ? "#f59e0b"
                                : "#34d399",
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Trend line" description="Recent monthly spend across the selected year.">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                tick={monthTickStyle}
                tickMargin={10}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={42}
                minTickGap={0}
                tickFormatter={formatMonthTick}
              />
              <YAxis stroke="#94a3b8" tickMargin={10} tick={monthTickStyle} width={36} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  background: "#020617",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  color: "#fff",
                }}
              />
              <Line type="monotone" dataKey="total" stroke="#60a5fa" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
