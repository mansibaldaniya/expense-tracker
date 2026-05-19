"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ExpenseForm } from "@/components/forms/expense-form";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import type { ApiResponse } from "@/types";

type ExtractedExpense = {
  amount: number;
  category: string;
  date: string;
  note: string;
};

export default function ImportPage() {
  const [text, setText] = useState("");
  const [extracted, setExtracted] = useState<ExtractedExpense | null>(null);
  const [loading, setLoading] = useState(false);

  async function extractExpense() {
    setLoading(true);
    const response = await fetch("/api/ai/extract-expense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = (await response.json()) as ApiResponse<{
      extracted: ExtractedExpense;
    }>;

    setLoading(false);

    if (!response.ok) {
      toast.error(data.message ?? "Unable to extract expense");
      return;
    }

    setExtracted(data.data.extracted ?? null);
    toast.success("Expense extracted");
  }

  async function saveExtractedExpense(values: {
    amount: string;
    category: string;
    date: string;
    note: string;
  }) {
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

    if (!response.ok) {
      const data = (await response.json()) as ApiResponse<Record<string, never>>;
      toast.error(data.message ?? "Unable to save expense");
      return;
    }

    toast.success("Expense saved");
    setExtracted(null);
    setText("");
  }

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">AI expense extraction</h1>
        <p className="mt-2 text-sm text-slate-300">
          Paste a receipt, SMS, or transaction text and Gemini will extract the structured expense data.
        </p>
        <Textarea
          className="mt-4"
          rows={6}
          placeholder='Example: "Paid ₹450 at Starbucks yesterday"'
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button
          onClick={() => void extractExpense()}
          disabled={loading || text.trim().length < 3}
          className="mt-4 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {loading ? "Extracting..." : "Extract expense"}
        </button>
      </Card>

      {extracted ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Review and save</h2>
          <div className="mt-4">
            <ExpenseForm
              defaultValues={{
                amount: String(extracted.amount),
                category: EXPENSE_CATEGORIES.includes(extracted.category as (typeof EXPENSE_CATEGORIES)[number])
                  ? (extracted.category as (typeof EXPENSE_CATEGORIES)[number])
                  : "Other",
                date: extracted.date,
                note: extracted.note,
              }}
              onSubmit={saveExtractedExpense}
            />
          </div>
        </Card>
      ) : null}
    </section>
  );
}
