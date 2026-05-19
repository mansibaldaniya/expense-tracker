"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import type { ApiResponse } from "@/types";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    async function loadUsers() {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const data = (await response.json()) as ApiResponse<{
        users: AdminUser[];
      }>;

      if (!response.ok) {
        toast.error(data.message ?? "Unable to load users");
        return;
      }

      setUsers(data.data.users ?? []);
    }

    void loadUsers();
  }, []);

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-semibold">User management</h1>
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/5 text-left text-slate-300">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3 text-slate-300">{user.email}</td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3 text-slate-300">{new Date(user.createdAt).toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
