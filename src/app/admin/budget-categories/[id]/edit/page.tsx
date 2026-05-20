"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { BudgetCategoryForm, type BudgetCategoryFormValues } from "@/components/forms/budget-category-form";
import type { ApiResponse } from "@/types";

type BudgetCategoryItem = {
  id: string;
  name: string;
};

export default function EditBudgetCategoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [category, setCategory] = useState<BudgetCategoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void (async () => {
      const response = await fetch(`/api/admin/budget-categories/${id}`, { cache: "no-store" });
      const payload = (await response.json()) as ApiResponse<{ category: BudgetCategoryItem }>;

      if (!response.ok) {
        toast.error(payload.message ?? "Unable to load category");
        if (active) {
          setLoading(false);
        }
        return;
      }

      if (active) {
        setCategory(payload.data.category);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(values: BudgetCategoryFormValues) {
    const response = await fetch(`/api/admin/budget-categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: values.name }),
    });

    const data = (await response.json()) as ApiResponse<Record<string, never>>;
    if (!response.ok) {
      toast.error(data.message ?? "Unable to update category");
      return;
    }

    toast.success("Category updated");
    router.push("/admin/budget-categories");
    router.refresh();
  }

  if (loading) {
    return <p className="text-sm text-slate-300">Loading category...</p>;
  }

  if (!category) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-300">Category not found.</p>
        <Link href="/admin/budget-categories" className="inline-flex items-center gap-2 text-emerald-300">
          <ArrowLeft className="h-4 w-4" />
          Back to categories
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <Link href="/admin/budget-categories" className="inline-flex items-center gap-2 text-emerald-300">
        <ArrowLeft className="h-4 w-4" />
        Back to categories
      </Link>
      <BudgetCategoryForm
        title="Edit category"
        description="Rename the category and keep budgets and expenses aligned with the catalog."
        submitLabel="Update category"
        defaultValues={{ name: category.name }}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
