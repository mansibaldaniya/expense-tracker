"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ExpenseForm, type ExpenseFormValues } from "@/components/forms/expense-form";
import type { ApiResponse } from "@/types";

export default function NewExpensePage() {
  const router = useRouter();

  async function handleSubmit(values: ExpenseFormValues) {
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
    router.push("/frontend/expenses");
    router.refresh();
  }

  return (
    <ExpenseForm
      title="Add expense"
      description="Capture a new expense and keep your records in sync."
      submitLabel="Save expense"
      onSubmit={handleSubmit}
    />
  );
}
