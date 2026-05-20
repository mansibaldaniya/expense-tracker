"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { ExpenseForm, type ExpenseFormValues } from "@/components/forms/expense-form";
import type { ApiResponse } from "@/types";

type ExpenseItem = {
  id: string;
  amount: number;
  category: string;
  date: string;
  note: string;
};

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [expense, setExpense] = useState<ExpenseItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void (async () => {
      const response = await fetch(`/api/expenses/${id}`, { cache: "no-store" });
      const data = (await response.json()) as ApiResponse<{
        expense: ExpenseItem;
      }>;

      if (!response.ok) {
        toast.error(data.message ?? "Unable to load expense");
        if (active) {
          setLoading(false);
        }
        return;
      }

      if (active) {
        setExpense(data.data.expense);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(values: ExpenseFormValues) {
    const response = await fetch(`/api/expenses/${id}`, {
      method: "PUT",
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
      toast.error(data.message ?? "Unable to update expense");
      return;
    }

    toast.success("Expense updated");
    router.push("/frontend/expenses");
    router.refresh();
  }

  if (loading) {
    return <p className="text-sm text-slate-300">Loading expense...</p>;
  }

  if (!expense) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-300">Expense not found.</p>
        <Link href="/frontend/expenses" className="inline-flex items-center gap-2 text-emerald-300">
          <ArrowLeft className="h-4 w-4" />
          Back to expenses
        </Link>
      </div>
    );
  }

  return (
    <ExpenseForm
      title="Edit expense"
      description="Update the tracked expense and save the latest values."
      submitLabel="Update expense"
      defaultValues={{
        amount: String(expense.amount),
        category: expense.category as ExpenseFormValues["category"],
        date: new Date(expense.date).toISOString().slice(0, 10),
        note: expense.note,
      }}
      onSubmit={handleSubmit}
    />
  );
}
