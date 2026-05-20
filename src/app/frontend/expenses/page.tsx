"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Download, Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ExpandableText } from "@/components/shared/expandable-text";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { MonthPicker } from "@/components/shared/month-picker";
import { ThemeSelect } from "@/components/shared/theme-select";
import { Card } from "@/components/ui/card";
import { useBudgetCategories } from "@/hooks/use-budget-categories";
import type { ApiResponse } from "@/types";

type ExpenseItem = {
  id: string;
  code: string;
  amount: number;
  category: string;
  date: string;
  note: string;
};

type ExpensePagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ExpenseFilters = {
  category: string;
  month: string;
  sortOrder: "asc" | "desc";
};

export default function ExpensesPage() {
  const { options: categoryOptions } = useBudgetCategories();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [pagination, setPagination] = useState<ExpensePagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<ExpenseFilters>({
    category: "",
    month: "",
    sortOrder: "desc",
  });
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<ExpenseItem | null>(null);

  useEffect(() => {
    void loadExpenses(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters.category, filters.month, filters.sortOrder]);

  async function loadExpenses(page = pagination.page) {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pagination.limit),
      sortBy: "createdAt",
      sortOrder: filters.sortOrder,
    });
    if (filters.category) params.set("category", filters.category);
    if (filters.month) params.set("month", filters.month);

    const response = await fetch(`/api/expenses?${params.toString()}`, { cache: "no-store" });
    const payload = (await response.json()) as ApiResponse<{
      items: ExpenseItem[];
      pagination: ExpensePagination;
    }>;

    if (!response.ok) {
      toast.error(payload.message ?? "Unable to load expenses");
      setLoading(false);
      return;
    }

    setExpenses(payload.data.items ?? []);
    setPagination(payload.data.pagination ?? { page, limit: pagination.limit, total: 0, totalPages: 1 });
    setLoading(false);
  }

  async function deleteExpense(id: string) {
    const response = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    const data = (await response.json()) as ApiResponse<Record<string, never>>;

    if (!response.ok) {
      toast.error(data.message ?? "Unable to delete expense");
      return;
    }

    toast.success("Expense deleted");
    await loadExpenses(
      expenses.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page
    );
  }

  function exportCsv() {
    const params = new URLSearchParams({
      type: "expenses",
      sortBy: "createdAt",
      sortOrder: filters.sortOrder,
    });
    if (filters.category) params.set("category", filters.category);
    if (filters.month) params.set("month", filters.month);
    window.location.assign(`/api/export/csv?${params.toString()}`);
  }

  return (
    <section className="space-y-6">
      <Card className="relative z-20 isolate p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Expenses</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Expense list</h1>
            <p className="mt-2 text-sm text-slate-300">Review, edit, or remove tracked expenses from one place.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void loadExpenses()}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <Link
              href="/frontend/expenses/new"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              <Plus className="h-4 w-4" />
              Add expense
            </Link>
          </div>
        </div>

        <div className="relative z-30 mt-6 grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.7fr)]">
          <ThemeSelect
            value={filters.category}
            onChange={(category) => {
              setPagination((current) => ({ ...current, page: 1 }));
              setFilters((current) => ({ ...current, category }));
            }}
            options={[
              { label: "All categories", value: "" },
              ...categoryOptions,
            ]}
            label="Category"
          />
          <MonthPicker
            value={filters.month}
            onChange={(month) => {
              setPagination((current) => ({ ...current, page: 1 }));
              setFilters((current) => ({ ...current, month }));
            }}
            placeholder="All months"
            allowClear
          />
          <ThemeSelect
            value={filters.sortOrder}
            onChange={(sortOrder) => {
              setPagination((current) => ({ ...current, page: 1 }));
              setFilters((current) => ({ ...current, sortOrder: sortOrder as "asc" | "desc" }));
            }}
            options={[
              { label: "Created: Newest first", value: "desc" },
              { label: "Created: Oldest first", value: "asc" },
            ]}
            label="Sort by created date"
          />
          <button
            type="button"
            onClick={() => {
              setPagination((current) => ({ ...current, page: 1 }));
              setFilters({ category: "", month: "", sortOrder: "desc" });
            }}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:border-emerald-400/30 hover:bg-white/8 sm:col-span-2 lg:col-span-1"
          >
            Clear all
          </button>
        </div>
      </Card>

      <Card className="relative z-10 p-6">
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-left text-slate-300">
              <tr>
                <th className="px-4 py-3">Expense ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={6}>
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td className="px-4 py-6" colSpan={6}>
                    <EmptyState className="min-h-[8rem]" />
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-4 py-3 text-slate-300">
                      <ExpandableText text={expense.code || expense.id} limit={20} />
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {new Date(expense.date).toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">{expense.category}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {expense.note ? <ExpandableText text={expense.note} limit={60} /> : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">Rs. {expense.amount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/frontend/expenses/${expense.id}/edit`}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <button
                          onClick={() => setPendingDelete(expense)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        pageSize={pagination.limit}
        onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete expense?"
        description={
          pendingDelete
            ? `This will permanently remove the ${pendingDelete.category} expense of Rs. ${pendingDelete.amount.toFixed(2)}.`
            : ""
        }
        confirmLabel="Delete expense"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          const expenseId = pendingDelete.id;
          setPendingDelete(null);
          await deleteExpense(expenseId);
        }}
      />
    </section>
  );
}
