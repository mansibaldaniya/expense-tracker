"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { BudgetCategoryForm, type BudgetCategoryFormValues } from "@/components/forms/budget-category-form";
import type { ApiResponse } from "@/types";

export default function NewBudgetCategoryPage() {
  const router = useRouter();

  async function handleSubmit(values: BudgetCategoryFormValues) {
    const response = await fetch("/api/admin/budget-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: values.name }),
    });

    const data = (await response.json()) as ApiResponse<Record<string, never>>;
    if (!response.ok) {
      toast.error(data.message ?? "Unable to save category");
      return;
    }

    toast.success("Category created");
    router.push("/admin/budget-categories");
    router.refresh();
  }

  return (
    <section className="space-y-6">
      <Link href="/admin/budget-categories" className="inline-flex items-center gap-2 text-emerald-300">
        <ArrowLeft className="h-4 w-4" />
        Back to categories
      </Link>
      <BudgetCategoryForm
        title="Add category"
        description="Create a new budget category that users can select in budgets and expenses."
        submitLabel="Save category"
        onSubmit={handleSubmit}
      />
    </section>
  );
}
