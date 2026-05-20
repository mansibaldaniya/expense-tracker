"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { BudgetForm, type BudgetFormValues } from "@/components/forms/budget-form";
import type { ApiResponse } from "@/types";

type BudgetItem = {
  id: string;
  category: string;
  limit: number;
  month: string;
  year: number;
};

export default function EditBudgetPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [budget, setBudget] = useState<BudgetItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void (async () => {
      const response = await fetch(`/api/budgets/${id}`, { cache: "no-store" });
      const data = (await response.json()) as ApiResponse<{
        budget: BudgetItem;
      }>;

      if (!response.ok) {
        toast.error(data.message ?? "Unable to load budget");
        if (active) {
          setLoading(false);
        }
        return;
      }

      if (active) {
        setBudget(data.data.budget);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(values: BudgetFormValues) {
    const response = await fetch(`/api/budgets/${id}`, {
      method: "PUT",
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
      toast.error(data.message ?? "Unable to update budget");
      return;
    }

    toast.success("Budget updated");
    router.push("/frontend/budgets");
    router.refresh();
  }

  if (loading) {
    return <p className="text-sm text-slate-300">Loading budget...</p>;
  }

  if (!budget) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-300">Budget not found.</p>
        <Link href="/frontend/budgets" className="inline-flex items-center gap-2 text-emerald-300">
          <ArrowLeft className="h-4 w-4" />
          Back to budgets
        </Link>
      </div>
    );
  }

  return (
    <BudgetForm
      title="Edit budget"
      description="Update the monthly budget and save the latest values."
      submitLabel="Update budget"
      defaultValues={{
        category: budget.category as BudgetFormValues["category"],
        limit: String(budget.limit),
        month: budget.month,
        year: String(budget.year),
      }}
      onSubmit={handleSubmit}
    />
  );
}
