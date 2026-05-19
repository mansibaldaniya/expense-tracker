"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ExpenseForm } from "@/components/forms/expense-form";
import { Card } from "@/components/ui/card";
import type { ApiResponse } from "@/types";

type ExpenseItem = {
  id: string;
  amount: number;
  category: string;
  date: string;
  note: string;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadExpenses() {
    setLoading(true);
    const response = await fetch("/api/expenses", { cache: "no-store" });
    const payload = (await response.json()) as ApiResponse<{
      items: ExpenseItem[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>;

    if (!response.ok) {
      toast.error(payload.message ?? "Unable to load expenses");
      setLoading(false);
      return;
    }

    setExpenses(payload.data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadExpenses();
  }, []);

  async function handleCreateExpense(values: {
    amount: string;
    category: string;
    date: string;
    note: string;
  }) {
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(values.amount),
        category: values.category,
        date: values.date,
        note: values.note,
      }),
    });

    const data = (await response.json()) as ApiResponse<Record<string, never>>;
    if (!response.ok) {
      toast.error(data.message ?? "Unable to save expense");
      return;
    }

    toast.success("Expense saved");
    await loadExpenses();
  }

  async function handleDeleteExpense(id: string) {
    const response = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    const data = (await response.json()) as ApiResponse<Record<string, never>>;

    if (!response.ok) {
      toast.error(data.message ?? "Unable to delete expense");
      return;
    }

    toast.success("Expense deleted");
    setExpenses((current) => current.filter((expense) => expense.id !== id));
  }

  return (
    <section className="space-y-6">
      <ExpenseForm onSubmit={handleCreateExpense} />
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Recent expenses</h1>
          <button
            onClick={() => void loadExpenses()}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-white"
          >
            Refresh
          </button>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-left text-slate-300">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={5}>
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={5}>
                    No expenses yet.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-4 py-3 text-slate-300">
                      {new Date(expense.date).toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">{expense.category}</td>
                    <td className="px-4 py-3 text-slate-300">{expense.note}</td>
                    <td className="px-4 py-3 text-right font-medium">Rs. {expense.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => void handleDeleteExpense(expense.id)}
                        className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
