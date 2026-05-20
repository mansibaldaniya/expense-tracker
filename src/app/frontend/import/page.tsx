"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [extracted, setExtracted] = useState<ExtractedExpense | null>(null);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  async function extractFromText() {
    setLoading(true);
    const response = await fetch("/api/ai/extract-expense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = (await response.json()) as ApiResponse<{ extracted: ExtractedExpense }>;
    setLoading(false);

    if (!response.ok) {
      toast.error(data.message ?? "Unable to extract expense");
      return;
    }

    setExtracted(data.data.extracted);
    toast.success("Expense extracted");
  }

  async function extractFromFile(selectedFile: File) {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("/api/ai/extract-expense/upload", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as ApiResponse<{ extracted: ExtractedExpense }>;
    setLoading(false);

    if (!response.ok) {
      toast.error(data.message ?? "Unable to extract expense from file");
      return;
    }

    setExtracted(data.data.extracted);
    toast.success("Expense extracted from file");
  }

  async function onExtract() {
    if (file) {
      await extractFromFile(file);
      return;
    }

    if (text.trim().length < 3) {
      toast.error("Add text or choose a file first");
      return;
    }

    await extractFromText();
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

    const data = (await response.json()) as ApiResponse<Record<string, never>>;

    if (!response.ok) {
      toast.error(data.message ?? "Unable to save expense");
      return;
    }

    toast.success("Expense saved");
    setExtracted(null);
    setText("");
    setFile(null);
    router.push("/frontend/expenses");
  }

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">AI expense extraction</h1>
        <p className="mt-2 text-sm text-slate-300">
          Paste a receipt, SMS, transaction text, or upload a PDF, image, or DOCX file.
        </p>
        <Textarea
          className="mt-4"
          rows={6}
          placeholder='Example: "Paid Rs. 450 at Starbucks yesterday"'
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <div className="mt-4 space-y-3">
          <input
            type="file"
            accept="image/*,application/pdf,.docx,.doc,.txt"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
          />
          {file ? <p className="text-xs text-slate-400">Selected file: {file.name}</p> : null}
        </div>
        <button
          onClick={() => void onExtract()}
          disabled={loading || (text.trim().length < 3 && !file)}
          className="mt-4 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {loading ? "Extracting..." : "Extract expense"}
        </button>
      </Card>

      {extracted ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Review and confirm</h2>
          <p className="mt-2 text-sm text-slate-300">
            Auto-populated values are ready. Review the details below, change the category if needed,
            and confirm to save the expense.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Amount</p>
              <p className="mt-2 text-xl font-semibold text-white">Rs. {extracted.amount.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Category</p>
              <p className="mt-2 text-xl font-semibold text-white">{extracted.category}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Date</p>
              <p className="mt-2 text-xl font-semibold text-white">{extracted.date || today}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Note</p>
              <p className="mt-2 text-sm font-medium text-white">{extracted.note || "-"}</p>
            </div>
          </div>
          <div className="mt-4">
            <ExpenseForm
              title="Extracted expense"
              description="Change any field if needed, especially the category, then confirm to create the expense record."
              submitLabel="Confirm & Save"
              defaultValues={{
                amount: String(extracted.amount),
                category: EXPENSE_CATEGORIES.includes(extracted.category as (typeof EXPENSE_CATEGORIES)[number])
                  ? (extracted.category as (typeof EXPENSE_CATEGORIES)[number])
                  : "Other",
                date: extracted.date || today,
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
