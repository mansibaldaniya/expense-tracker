"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, Pencil, Plus, RefreshCcw, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { ThemeSelect } from "@/components/shared/theme-select";
import { Card } from "@/components/ui/card";
import type { ApiResponse } from "@/types";

type CategoryItem = {
  id: string;
  name: string;
  normalizedName: string;
  expenseCount: number;
  budgetCount: number;
  createdAt: string;
  updatedAt: string;
};

type PaginationState = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type FilterState = {
  search: string;
  sortOrder: "asc" | "desc";
};

export default function AdminBudgetCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    sortOrder: "desc",
  });
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<CategoryItem | null>(null);

  useEffect(() => {
    void loadCategories(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters.search, filters.sortOrder]);

  async function loadCategories(page = pagination.page) {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pagination.limit),
      sortOrder: filters.sortOrder,
    });

    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    const response = await fetch(`/api/admin/budget-categories?${params.toString()}`, { cache: "no-store" });
    const payload = (await response.json()) as ApiResponse<{
      categories: CategoryItem[];
      pagination: PaginationState;
    }>;

    if (!response.ok) {
      toast.error(payload.message ?? "Unable to load budget categories");
      setLoading(false);
      return;
    }

    setCategories(payload.data.categories ?? []);
    setPagination(payload.data.pagination ?? { page, limit: pagination.limit, total: 0, totalPages: 1 });
    setLoading(false);
  }

  async function deleteCategory(category: CategoryItem) {
    setPendingDelete(null);
    const response = await fetch(`/api/admin/budget-categories/${category.id}`, { method: "DELETE" });
    const payload = (await response.json()) as ApiResponse<Record<string, never>>;

    if (!response.ok) {
      toast.error(payload.message ?? "Unable to delete category");
      return;
    }

    toast.success("Category deleted");
    const nextPage = categories.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
    await loadCategories(nextPage);
  }

  function exportCsv() {
    const params = new URLSearchParams({
      type: "budget-categories",
      sortOrder: filters.sortOrder,
    });
    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }
    window.location.assign(`/api/export/csv?${params.toString()}`);
  }

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold text-white">Budget categories</h1>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Create and maintain the category names used across budgets and expense tracking.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void loadCategories(pagination.page)}
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
              href="/admin/budget-categories/new"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              <Plus className="h-4 w-4" />
              Add category
            </Link>
          </div>
        </div>

        <div className="mt-6 grid items-end gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,0.9fr)_minmax(0,0.7fr)]">
          <div className="relative">
            <label className="mb-2 block text-sm text-slate-400">Search</label>
            <div className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-white">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={filters.search}
                onChange={(event) => {
                  setPagination((current) => ({ ...current, page: 1 }));
                  setFilters((current) => ({ ...current, search: event.target.value }));
                }}
                placeholder="Search category name"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (!filters.search) return;
                  setPagination((current) => ({ ...current, page: 1 }));
                  setFilters((current) => ({ ...current, search: "" }));
                }}
                aria-label={filters.search ? "Clear search" : "Search"}
                className="shrink-0 rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                {filters.search ? <X className="h-4 w-4" /> : null}
              </button>
            </div>
          </div>

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
              setFilters({ search: "", sortOrder: "desc" });
              setPagination((current) => ({ ...current, page: 1 }));
            }}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:border-emerald-400/30 hover:bg-white/8"
          >
            Clear all
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-left text-slate-300">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Expense use</th>
                <th className="px-4 py-3">Budget use</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={5}>
                    Loading budget categories...
                  </td>
                </tr>
              ) : categories.length ? (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-4 py-4 font-medium text-white">{category.name}</td>
                    <td className="px-4 py-4 text-slate-300">{category.expenseCount.toLocaleString()}</td>
                    <td className="px-4 py-4 text-slate-300">{category.budgetCount.toLocaleString()}</td>
                    <td className="px-4 py-4 text-slate-300">{new Date(category.createdAt).toISOString().slice(0, 10)}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/budget-categories/${category.id}/edit`}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(category)}
                          disabled={category.expenseCount > 0}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                            category.expenseCount > 0
                              ? "cursor-not-allowed border-white/10 bg-white/5 text-slate-500"
                              : "border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                          }`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {category.expenseCount > 0 ? "In use" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6" colSpan={5}>
                    <EmptyState className="min-h-[8rem]" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          pageSize={pagination.limit}
          onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
          className="mt-4"
        />
      </Card>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete category?"
        description={
          pendingDelete
            ? pendingDelete.expenseCount > 0
              ? `This category is still used by ${pendingDelete.expenseCount} expense(s), so it cannot be deleted.`
              : `This will remove the ${pendingDelete.name} category from the admin catalog.`
            : ""
        }
        confirmLabel="Delete category"
        confirmVariant="destructive"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          if (pendingDelete.expenseCount > 0) {
            toast.error("Category is in use by expenses and cannot be deleted");
            setPendingDelete(null);
            return;
          }
          await deleteCategory(pendingDelete);
        }}
      />
    </section>
  );
}
