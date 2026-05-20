"use client";

import { useEffect } from "react";
import type { ComponentType, ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ArrowRight, CalendarRange, CircleDollarSign, ListFilter, NotebookPen } from "lucide-react";
import { budgetSchema } from "@/lib/validations/budget";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MonthPicker } from "@/components/shared/month-picker";
import { ThemeSelect } from "@/components/shared/theme-select";

export type BudgetFormValues = {
  category: (typeof EXPENSE_CATEGORIES)[number];
  limit: string;
  month: string;
  year: string;
};

type BudgetFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  defaultValues?: Partial<BudgetFormValues>;
  onSubmit: (values: BudgetFormValues) => Promise<void> | void;
};

const baseDefaults: BudgetFormValues = {
  category: "Food",
  limit: "5000",
  month: new Date().toISOString().slice(0, 7),
  year: String(new Date().getFullYear()),
};

function FieldLabel({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
      <Icon className="h-4 w-4 text-emerald-300" />
      {children}
    </div>
  );
}

export function BudgetForm({ title, description, submitLabel, defaultValues, onSubmit }: BudgetFormProps) {
  const { register, control, handleSubmit, formState, reset } = useForm<BudgetFormValues>({
    defaultValues: {
      ...baseDefaults,
      ...defaultValues,
    },
  });

  useEffect(() => {
    reset({ ...baseDefaults, ...defaultValues });
  }, [defaultValues, reset]);

  async function submit(values: BudgetFormValues) {
    const parsed = budgetSchema.safeParse({
      category: values.category,
      limit: Number(values.limit),
      month: values.month,
      year: Number(values.year),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    await onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
        </div>
        <div className="hidden rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-3 sm:block">
          <CircleDollarSign className="h-5 w-5 text-emerald-300" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel icon={ListFilter}>Category</FieldLabel>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <ThemeSelect
                value={field.value}
                onChange={field.onChange}
                options={EXPENSE_CATEGORIES.map((item) => ({ label: item, value: item }))}
                label="Category"
              />
            )}
          />
        </div>

        <div>
          <FieldLabel icon={CircleDollarSign}>Limit</FieldLabel>
          <Input type="number" placeholder="Limit" {...register("limit")} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel icon={CalendarRange}>Month</FieldLabel>
          <Controller
            control={control}
            name="month"
            render={({ field }) => <MonthPicker value={field.value} onChange={field.onChange} compact />}
          />
        </div>
        <div>
          <FieldLabel icon={NotebookPen}>Year</FieldLabel>
          <Input type="number" placeholder="Year" {...register("year")} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={formState.isSubmitting}
          className="h-12 rounded-2xl bg-emerald-400 px-5 font-semibold text-slate-950 hover:bg-emerald-300"
        >
          {formState.isSubmitting ? "Saving..." : submitLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
