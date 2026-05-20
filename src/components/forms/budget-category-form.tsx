"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Tag, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type BudgetCategoryFormValues = {
  name: string;
};

type BudgetCategoryFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  defaultValues?: Partial<BudgetCategoryFormValues>;
  onSubmit: (values: BudgetCategoryFormValues) => Promise<void> | void;
};

const baseDefaults: BudgetCategoryFormValues = {
  name: "",
};

export function BudgetCategoryForm({
  title,
  description,
  submitLabel,
  defaultValues,
  onSubmit,
}: BudgetCategoryFormProps) {
  const { register, handleSubmit, formState, reset } = useForm<BudgetCategoryFormValues>({
    defaultValues: { ...baseDefaults, ...defaultValues },
  });

  useEffect(() => {
    reset({ ...baseDefaults, ...defaultValues });
  }, [defaultValues, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/20"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
        </div>
        <div className="hidden rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-3 sm:block">
          <Tag className="h-5 w-5 text-emerald-300" />
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-slate-200">Category name</label>
        <Input placeholder="Enter category name" {...register("name")} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={formState.isSubmitting}
          className="h-12 rounded-2xl bg-emerald-400 px-5 font-semibold text-slate-950 hover:bg-emerald-300"
        >
          {formState.isSubmitting ? "Saving..." : submitLabel}
          <Save className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
