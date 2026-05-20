"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { BudgetForm, type BudgetFormValues } from "@/components/forms/budget-form";
import type { ApiResponse } from "@/types";

export default function NewBudgetPage() {
  const router = useRouter();

  async function handleSubmit(values: BudgetFormValues) {
    const response = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: values.category,
        limit: Number(values.limit),
        month: values.month,
        year: Number(values.year),
      }),
    });

    const data = (await response.json()) as ApiResponse<Record<string, never>>;
    if (!response.ok) {
      toast.error(data.message ?? "Unable to save budget");
      return;
    }

    toast.success("Budget saved");
    router.push("/frontend/budgets");
    router.refresh();
  }

  return (
    <BudgetForm
      title="Add budget"
      description="Create a monthly budget for a category."
      submitLabel="Save budget"
      onSubmit={handleSubmit}
    />
  );
}
