"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Download, Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { MonthPicker } from "@/components/shared/month-picker";
import { Pagination } from "@/components/shared/pagination";
import { ThemeSelect } from "@/components/shared/theme-select";
import { Card } from "@/components/ui/card";
import { useBudgetCategories } from "@/hooks/use-budget-categories";
import type { ApiResponse } from "@/types";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatBudgetPeriod(month: string, year: number) {
  const [monthYear, monthPart] = month.includes("-") ? month.split("-") : [String(year), month];
  const parsedMonth = Number(monthPart);
  const parsedYear = Number(monthYear);

  if (Number.isFinite(parsedYear) && parsedYear > 0 && Number.isFinite(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
    return `${monthNames[parsedMonth - 1]} ${parsedYear}`;
  }

  if (month && year) {
    return `${month} ${year}`;
  }

  return String(year || month);
}

type BudgetItem = {
  id: string;
  code: string;
  category: string;
  limit: number;
  month: string;
  year: number;
};

type BudgetPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type BudgetFilters = {
  category: string;
  month: string;
  sortOrder: "asc" | "desc";
};

export default function BudgetsPage() {
  const { options: categoryOptions } = useBudgetCategories();
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [pagination, setPagination] = useState<BudgetPagination>({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<BudgetFilters>({
    category: "",
    month: "",
    sortOrder: "desc",
  });
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<BudgetItem | null>(null);

  useEffect(() => {
    void loadBudgets(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters.category, filters.month, filters.sortOrder]);

  async function loadBudgets(page = pagination.page) {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pagination.limit),
      sortOrder: filters.sortOrder,
    });
    if (filters.category) params.set("category", filters.category);
    if (filters.month) params.set("month", filters.month);

    const response = await fetch(`/api/budgets?${params.toString()}`, { cache: "no-store" });
    const data = (await response.json()) as ApiResponse<{
      budgets: BudgetItem[];
      pagination: BudgetPagination;
    }>;

    if (!response.ok) {
      toast.error(data.message ?? "Unable to load budgets");
      setLoading(false);
      return;
    }

    setBudgets(data.data.budgets ?? []);
    setPagination(data.data.pagination ?? { page, limit: pagination.limit, total: 0, totalPages: 1 });
    setLoading(false);
  }

  async function deleteBudget(id: string) {
    const response = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    const data = (await response.json()) as ApiResponse<Record<string, never>>;
    if (!response.ok) {
      toast.error(data.message ?? "Unable to delete budget");
      return;
    }

    toast.success("Budget deleted");
    await loadBudgets(budgets.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page);
  }

  function exportCsv() {
    const params = new URLSearchParams({
      type: "budgets",
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
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Budgets</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Budget list</h1>
            <p className="mt-2 text-sm text-slate-300">Review, edit, or remove monthly budgets from one place.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void loadBudgets()}
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
              href="/frontend/budgets/new"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              <Plus className="h-4 w-4" />
              Add budget
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
        <div className="grid gap-4 md:grid-cols-2">
          {loading ? (
            <p className="text-sm text-slate-400">Loading budgets...</p>
          ) : budgets.length === 0 ? (
            <div className="md:col-span-2">
              <EmptyState className="min-h-[8rem]" />
            </div>
          ) : (
            budgets.map((budget) => (
              <div
                key={budget.id}
                className="flex min-h-[11.5rem] flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Budget ID</p>
                    <p className="mt-1.5 text-sm text-slate-300">{budget.code || budget.id}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.28em] text-slate-400">Category</p>
                    <h3 className="mt-1.5 text-lg font-semibold text-white">{budget.category}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/frontend/budgets/${budget.id}/edit`}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <button
                      onClick={() => setPendingDelete(budget)}
                      className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-emerald-200">Budget amount</p>
                  <p className="mt-1.5 text-2xl font-semibold text-emerald-300">Rs. {budget.limit.toFixed(2)}</p>
                  <p className="mt-2 text-sm text-slate-300">
                    For <span className="font-semibold text-white">{formatBudgetPeriod(budget.month, budget.year)}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        pageSize={pagination.limit}
        onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
        className="mt-1"
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete budget?"
        description={
          pendingDelete
            ? `This will permanently remove the ${pendingDelete.category} budget for ${pendingDelete.month}-${pendingDelete.year}.`
            : ""
        }
        confirmLabel="Delete budget"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          const budgetId = pendingDelete.id;
          setPendingDelete(null);
          await deleteBudget(budgetId);
        }}
      />
    </section>
  );
}
