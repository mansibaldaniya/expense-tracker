"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import type { ApiResponse } from "@/types";

type BudgetItem = {
  id: string;
  category: string;
  limit: number;
  month: string;
  year: number;
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [category, setCategory] = useState<(typeof EXPENSE_CATEGORIES)[number]>("Food");
  const [limit, setLimit] = useState("5000");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [year, setYear] = useState(String(new Date().getFullYear()));

  async function loadBudgets() {
    const response = await fetch("/api/budgets", { cache: "no-store" });
    const data = (await response.json()) as ApiResponse<{
      budgets: BudgetItem[];
    }>;

    if (!response.ok) {
      toast.error(data.message ?? "Unable to load budgets");
      return;
    }

    setBudgets(data.data.budgets ?? []);
  }

  useEffect(() => {
    void loadBudgets();
  }, []);

  async function saveBudget() {
    const response = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        limit: Number(limit),
        month,
        year: Number(year),
      }),
    });

    const data = (await response.json()) as ApiResponse<Record<string, never>>;
    if (!response.ok) {
      toast.error(data.message ?? "Unable to save budget");
      return;
    }

    toast.success("Budget saved");
    await loadBudgets();
  }

  async function deleteBudget(id: string) {
    const response = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    const data = (await response.json()) as ApiResponse<Record<string, never>>;
    if (!response.ok) {
      toast.error(data.message ?? "Unable to delete budget");
      return;
    }

    toast.success("Budget deleted");
    setBudgets((current) => current.filter((budget) => budget.id !== id));
  }

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Monthly budgets</h1>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as (typeof EXPENSE_CATEGORIES)[number])}
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
          >
            {EXPENSE_CATEGORIES.map((item) => (
              <option key={item} value={item} className="text-slate-950">
                {item}
              </option>
            ))}
          </select>
          <Input type="number" placeholder="Limit" value={limit} onChange={(event) => setLimit(event.target.value)} />
          <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          <Input type="number" placeholder="Year" value={year} onChange={(event) => setYear(event.target.value)} />
        </div>
        <button
          onClick={() => void saveBudget()}
          className="mt-4 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950"
        >
          Save budget
        </button>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Saved budgets</h2>
          <button onClick={() => void loadBudgets()} className="rounded-full border border-white/10 px-4 py-2 text-sm">
            Refresh
          </button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {budgets.length === 0 ? (
            <p className="text-sm text-slate-400">No budgets configured yet.</p>
          ) : (
            budgets.map((budget) => (
              <div key={budget.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{budget.category}</h3>
                  <button
                    onClick={() => void deleteBudget(budget.id)}
                    className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs text-red-200"
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  Rs. {budget.limit.toFixed(2)} for {budget.month}-{budget.year}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </section>
  );
}
