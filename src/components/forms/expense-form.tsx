"use client";

import { useEffect } from "react";
import type { ComponentType, ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ArrowRight, CalendarDays, IndianRupee, ListFilter, NotebookPen } from "lucide-react";
import { expenseSchema } from "@/lib/validations/expense";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThemeSelect } from "@/components/shared/theme-select";

export type ExpenseFormValues = {
  amount: string;
  category: (typeof EXPENSE_CATEGORIES)[number];
  date: string;
  note: string;
};

type ExpenseFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  defaultValues?: Partial<ExpenseFormValues>;
  onSubmit: (values: ExpenseFormValues) => Promise<void> | void;
};

const baseDefaults: ExpenseFormValues = {
  amount: "",
  category: "Food",
  date: new Date().toISOString().slice(0, 10),
  note: "",
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

export function ExpenseForm({ title, description, submitLabel, defaultValues, onSubmit }: ExpenseFormProps) {
  const { register, control, handleSubmit, formState, reset } = useForm<ExpenseFormValues>({
    defaultValues: {
      ...baseDefaults,
      ...defaultValues,
    },
  });

  useEffect(() => {
    reset({ ...baseDefaults, ...defaultValues });
  }, [defaultValues, reset]);

  async function submit(values: ExpenseFormValues) {
    const parsed = expenseSchema.safeParse(values);
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
          <NotebookPen className="h-5 w-5 text-emerald-300" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel icon={IndianRupee}>Amount</FieldLabel>
          <Input type="number" step="0.01" placeholder="Amount" {...register("amount")} />
        </div>
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
      </div>

      <div className="mt-4">
        <FieldLabel icon={CalendarDays}>Date</FieldLabel>
        <Input type="date" {...register("date")} />
      </div>

      <div className="mt-4">
        <FieldLabel icon={NotebookPen}>Note</FieldLabel>
        <Textarea placeholder="Optional note" {...register("note")} />
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
