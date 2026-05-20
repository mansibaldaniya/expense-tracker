"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { useParams } from "next/navigation";
import { BadgeAlert, Banknote, CalendarDays, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { EmptyState } from "@/components/shared/empty-state";
import { ExpandableText } from "@/components/shared/expandable-text";
import { MonthPicker } from "@/components/shared/month-picker";
import { Pagination } from "@/components/shared/pagination";
import { Card } from "@/components/ui/card";
import type { ApiResponse } from "@/types";

type UserDetail = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  month: string;
  summary: {
    totalBudgets: number;
    totalExpenses: number;
    totalExpenseAmount: number;
    totalAlerts: number;
  };
  budgets: Array<{
    id: string;
    code?: string;
    category: string;
    limit: number;
    month: string;
    year: number;
    spent: number;
    percent: number;
    status: "safe" | "warning" | "danger";
  }>;
  expenses: Array<{
    id: string;
    code?: string;
    amount: number;
    category: string;
    date: string;
    note: string;
  }>;
  alerts: Array<{
    budgetId: string;
    category: string;
    spent: number;
    limit: number;
    percent: number;
    status: "safe" | "warning" | "danger";
  }>;
};

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="relative overflow-hidden p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-emerald-400" />
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
  );
}

export default function AdminUserDetailsPage() {
  const params = useParams<{ id: string }>();
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [details, setDetails] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expensePage, setExpensePage] = useState(1);
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;
  const expensePageSize = 5;

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      if (!userId) {
        toast.error("Invalid user id");
        if (active) {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}?month=${selectedMonth}`, { cache: "no-store" });
      const payload = (await response.json()) as ApiResponse<UserDetail>;

      if (!response.ok) {
        toast.error(payload.message ?? "Unable to load user details");
        if (active) {
          setLoading(false);
        }
        return;
      }

      if (active) {
        setDetails(payload.data);
        setLoading(false);
      }
    }

    void loadDetails();

    return () => {
      active = false;
    };
  }, [selectedMonth, userId]);

  useEffect(() => {
    setExpensePage(1);
  }, [selectedMonth]);

  const user = details?.user;
  const expenseTotal = details?.expenses.length ?? 0;
  const expenseTotalPages = Math.max(1, Math.ceil(expenseTotal / expensePageSize));
  const visibleExpenses = details?.expenses.slice((expensePage - 1) * expensePageSize, expensePage * expensePageSize) ?? [];

  return (
    <section className="space-y-6">
      <Card className="relative z-30 overflow-visible p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">User details</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{user?.name ?? "Loading..."}</h1>
            <p className="mt-2 text-sm text-slate-300">{user?.email ?? "Loading user profile"}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">
              {user?.role ?? "user"}
            </p>
          </div>

          <div className="relative z-40 flex flex-wrap items-center gap-3">
            <MonthPicker value={selectedMonth} onChange={setSelectedMonth} compact className="relative z-[200]" />
          </div>
        </div>
      </Card>

      <div className="relative z-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total budgets"
          value={String(details?.summary.totalBudgets ?? 0)}
          description="All budgets created by this user."
          icon={Wallet}
        />
        <StatCard
          title="Total expenses"
          value={String(details?.summary.totalExpenses ?? 0)}
          description="All expenses recorded by this user."
          icon={Banknote}
        />
        <StatCard
          title="Budget alerts"
          value={String(details?.summary.totalAlerts ?? 0)}
          description="Budgets in warning or danger status."
          icon={BadgeAlert}
        />
        <StatCard
          title="Lifetime spend"
          value={`Rs. ${details?.summary.totalExpenseAmount.toFixed(2) ?? "0.00"}`}
          description="Total expense amount across all time."
          icon={CalendarDays}
        />
      </div>

      <div className="relative z-10">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Monthly budgets</h2>
              <p className="mt-1 text-sm text-slate-400">
                Budget limits, spending, and alert status for {selectedMonth}.
              </p>
            </div>
            <Wallet className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/5 text-left text-slate-300">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Limit</th>
                  <th className="px-4 py-3">Spent</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-400" colSpan={4}>
                      Loading monthly budget data...
                    </td>
                  </tr>
                ) : details?.budgets.length ? (
                  details.budgets.map((budget) => {
                    const badgeClass =
                      budget.status === "danger"
                        ? "bg-rose-500/15 text-rose-200 border-rose-400/30"
                        : budget.status === "warning"
                          ? "bg-amber-500/15 text-amber-200 border-amber-400/30"
                          : "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";

                    return (
                      <tr key={budget.id}>
                        <td className="px-4 py-3 font-medium text-white">{budget.category}</td>
                        <td className="px-4 py-3 text-slate-300">Rs. {budget.limit.toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-300">Rs. {budget.spent.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.22em] ${badgeClass}`}
                          >
                            {budget.status === "danger" ? "Alert" : budget.status === "warning" ? "Watch" : "Normal"} - {Math.round(budget.percent)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="px-4 py-6" colSpan={4}>
                      <EmptyState className="min-h-[8rem]" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card className="relative z-10 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Monthly expenses</h2>
            <p className="mt-1 text-sm text-slate-400">Expenses recorded for {selectedMonth}.</p>
          </div>
          <Banknote className="h-5 w-5 text-slate-400" />
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-left text-slate-300">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={4}>
                    Loading expenses...
                  </td>
                </tr>
              ) : visibleExpenses.length ? (
                visibleExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-4 py-3 text-slate-300">{new Date(expense.date).toISOString().slice(0, 10)}</td>
                    <td className="px-4 py-3 font-medium text-white">{expense.category}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {expense.note ? <ExpandableText text={expense.note} limit={60} /> : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-white">Rs. {expense.amount.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6" colSpan={4}>
                    <EmptyState className="min-h-[8rem]" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && expenseTotal > expensePageSize ? (
          <div className="mt-4">
            <Pagination
              page={expensePage}
              totalPages={expenseTotalPages}
              total={expenseTotal}
              pageSize={expensePageSize}
              onPageChange={setExpensePage}
            />
          </div>
        ) : null}
      </Card>

    </section>
  );
}
