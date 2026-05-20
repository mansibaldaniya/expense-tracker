"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw, Search, Trash2, X, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { ThemeSelect } from "@/components/shared/theme-select";
import { Card } from "@/components/ui/card";
import type { ApiResponse } from "@/types";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type AdminUserPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type UserFilters = {
  search: string;
  sortOrder: "asc" | "desc";
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<AdminUserPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    sortOrder: "desc",
  });
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);

  useEffect(() => {
    void loadUsers(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters.search, filters.sortOrder]);

  async function loadUsers(page = pagination.page) {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pagination.limit),
      sortOrder: filters.sortOrder,
    });

    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    const response = await fetch(`/api/admin/users?${params.toString()}`, { cache: "no-store" });
    const payload = (await response.json()) as ApiResponse<{
      users: AdminUser[];
      pagination: AdminUserPagination;
    }>;

    if (!response.ok) {
      toast.error(payload.message ?? "Unable to load users");
      setLoading(false);
      return;
    }

    setUsers(payload.data.users ?? []);
    setPagination(payload.data.pagination ?? { page, limit: pagination.limit, total: 0, totalPages: 1 });
    setLoading(false);
  }

  async function deleteUser(userId: string) {
    const response = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    const payload = (await response.json()) as ApiResponse<Record<string, never>>;

    if (!response.ok) {
      toast.error(payload.message ?? "Unable to delete user");
      return;
    }

    toast.success("User deleted");
    setPendingDelete(null);
    await loadUsers(users.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page);
    router.refresh();
  }

  return (
    <section className="space-y-6">
      <Card className="relative z-20 isolate p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Users</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">User management</h1>
            <p className="mt-2 text-sm text-slate-300">Search users, switch sorting, and review account creation dates.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void loadUsers()}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="relative z-30 mt-6 grid items-end gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,0.9fr)_minmax(0,0.7fr)]">
          <div className="relative">
            <label className="mb-2 block text-sm text-slate-400">Search</label>
            <div className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-white">
              <input
                value={filters.search}
                onChange={(event) => {
                  setPagination((current) => ({ ...current, page: 1 }));
                  setFilters((current) => ({ ...current, search: event.target.value }));
                }}
                placeholder="Search by name or email"
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
                {filters.search ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
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
            label="Created At"
          />

          <button
            type="button"
            onClick={() => {
              setPagination((current) => ({ ...current, page: 1 }));
              setFilters({ search: "", sortOrder: "desc" });
            }}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:border-emerald-400/30 hover:bg-white/8"
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
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={5}>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-4 py-6" colSpan={5}>
                    <EmptyState className="min-h-[8rem]" />
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-white">
                      <Link href={`/admin/users/${user.id}`} className="hover:text-emerald-300">
                        {user.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-200">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{new Date(user.createdAt).toISOString().slice(0, 10)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                        >
                          View
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(user)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 transition hover:bg-red-500/20"
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
        title="Delete user?"
        description={
          pendingDelete
            ? `This will hard delete ${pendingDelete.name} and remove their budgets and expenses.`
            : ""
        }
        confirmLabel="Delete user"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deleteUser(pendingDelete.id);
        }}
      />
    </section>
  );
}
