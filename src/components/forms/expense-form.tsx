"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { expenseSchema } from "@/lib/validations/expense";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ExpenseFormValues = {
  amount: string;
  category: (typeof EXPENSE_CATEGORIES)[number];
  date: string;
  note: string;
};

type ExpenseFormProps = {
  defaultValues?: Partial<ExpenseFormValues>;
  onSubmit: (values: ExpenseFormValues) => Promise<void> | void;
};

export function ExpenseForm({ defaultValues, onSubmit }: ExpenseFormProps) {
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<ExpenseFormValues>({
    defaultValues: {
      amount: "",
      category: "Food",
      date: new Date().toISOString().slice(0, 10),
      note: "",
      ...defaultValues,
    },
  });

  async function submit(values: ExpenseFormValues) {
    const parsed = expenseSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    setError(null);
    await onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Input type="number" step="0.01" placeholder="Amount" {...register("amount")} />
        <select
          className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
          {...register("category")}
        >
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category} className="text-slate-950">
              {category}
            </option>
          ))}
        </select>
      </div>
      <Input type="date" {...register("date")} />
      <Textarea placeholder="Optional note" {...register("note")} />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
      >
        {formState.isSubmitting ? "Saving..." : "Save expense"}
      </button>
    </form>
  );
}
