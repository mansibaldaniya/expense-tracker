"use client";

import { useEffect, useState } from "react";
import type { ApiResponse } from "@/types";
import { Card } from "@/components/ui/card";
import { BarChart3, Bot, FileText, ShieldCheck, Wallet, ClipboardList, Upload, PieChart } from "lucide-react";

type PublicOverview = {
  totals: {
    users: number;
    expenses: number;
    budgets: number;
  };
};

export default function AboutUsPage() {
  const [overview, setOverview] = useState<PublicOverview | null>(null);

  useEffect(() => {
    async function loadOverview() {
      const response = await fetch("/api/public/overview", { cache: "no-store" });
      const data = (await response.json()) as ApiResponse<PublicOverview>;
      if (response.ok) {
        setOverview(data.data);
      }
    }

    void loadOverview();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <h1 className="text-3xl font-semibold">About AI Expense Tracker</h1>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
          AI Expense Tracker is a secure finance platform that helps users log expenses faster, analyze spending
          patterns, set budgets, export data, and manage everything through a modern dashboard and admin panel.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Users", overview?.totals.users ?? 0],
            ["Expenses", overview?.totals.expenses ?? 0],
            ["Budgets", overview?.totals.budgets ?? 0],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">{label as string}</p>
              <p className="mt-2 text-2xl font-semibold">{value as number}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Bot className="h-5 w-5 text-emerald-300" />
            How the AI flow works
          </h2>
          <ol className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
            <li>
              <span className="font-semibold text-white">1. Paste or upload</span> a receipt, SMS, bill, transaction text, PDF, image, or DOCX file.
            </li>
            <li>
              <span className="font-semibold text-white">2. Gemini extracts</span> amount, category, date, and note into structured expense data.
            </li>
            <li>
              <span className="font-semibold text-white">3. Review and edit</span> the extracted values before saving, so the user stays in control.
            </li>
            <li>
              <span className="font-semibold text-white">4. Save to MongoDB</span> and instantly show it in the dashboard, tables, budgets, and reports.
            </li>
          </ol>
        </Card>

        <Card className="p-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            Core functionality
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <Wallet className="mt-0.5 h-4 w-4 text-emerald-300" />
              Manual expense entry with validation and edit/delete support.
            </li>
            <li className="flex items-start gap-3">
              <Upload className="mt-0.5 h-4 w-4 text-emerald-300" />
              AI import for text, PDF, image, DOCX, DOC, and TXT files.
            </li>
            <li className="flex items-start gap-3">
              <PieChart className="mt-0.5 h-4 w-4 text-emerald-300" />
              Dashboard analytics with category breakdowns and monthly trends.
            </li>
            <li className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 h-4 w-4 text-emerald-300" />
              Budget alerts that highlight spending at 80% and 100%.
            </li>
            <li className="flex items-start gap-3">
              <FileText className="mt-0.5 h-4 w-4 text-emerald-300" />
              CSV export for monthly or full expense history.
            </li>
            <li className="flex items-start gap-3">
              <BarChart3 className="mt-0.5 h-4 w-4 text-emerald-300" />
              Role-based admin views for users, analytics, and overall activity.
            </li>
          </ul>
        </Card>
      </div>

      <Card className="p-8">
        <h2 className="text-xl font-semibold">Who it is for</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          The app is designed for individuals, small teams, and admins who need a secure way to track spending,
          reduce manual entry, and get a quick view of cash flow and category-wise expenses.
        </p>
      </Card>
    </div>
  );
}
