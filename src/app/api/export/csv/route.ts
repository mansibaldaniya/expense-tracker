import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { apiError } from "@/lib/api-response";
import { BudgetModel } from "@/models/Budget";
import { BudgetCategoryModel } from "@/models/BudgetCategory";
import { ExpenseModel } from "@/models/Expense";
import { UserModel } from "@/models/User";
import { ensureBudgetCategoriesSeeded } from "@/services/budget-category.service";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeCsv(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function toCsv(rows: unknown[][]) {
  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}

function parseSortOrder(value: string | null) {
  return value === "asc" ? "asc" : "desc";
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const type = (request.nextUrl.searchParams.get("type") ?? "expenses").toLowerCase();
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return apiError("Unauthorized", 401);
    }

    const sortOrder = parseSortOrder(request.nextUrl.searchParams.get("sortOrder"));
    let rows: string[][];
    let filename = "export.csv";

    if (type === "expenses") {
      const query: Record<string, unknown> = { userId: auth.userId };
      const category = request.nextUrl.searchParams.get("category")?.trim() ?? "";
      const month = request.nextUrl.searchParams.get("month")?.trim() ?? "";
      const date = request.nextUrl.searchParams.get("date")?.trim() ?? "";
      const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
      const sortBy = request.nextUrl.searchParams.get("sortBy") === "date" ? "date" : "createdAt";

      if (category) query.category = category;
      if (date) {
        query.date = new Date(date);
      } else if (month) {
        const [year, monthIndex] = month.split("-").map(Number);
        query.date = {
          $gte: new Date(year, monthIndex - 1, 1),
          $lt: new Date(year, monthIndex, 1),
        };
      }
      if (search) {
        query.note = { $regex: escapeRegex(search), $options: "i" };
      }

      const sortDirection = sortOrder === "asc" ? 1 : -1;
      const sort =
        sortBy === "date"
          ? ({ date: sortDirection, createdAt: -1 } as const)
          : ({ createdAt: sortDirection, date: -1 } as const);
      const expenses = await ExpenseModel.find(query).sort(sort).lean();

      rows = [
        ["code", "date", "category", "amount", "note", "createdAt"],
        ...expenses.map((expense) => [
          expense.code ?? "",
          expense.date.toISOString().slice(0, 10),
          expense.category,
          String(expense.amount),
          expense.note ?? "",
          expense.createdAt.toISOString(),
        ]),
      ];
      filename = `expenses${month ? `-${month}` : ""}.csv`;
    } else if (type === "budgets") {
      const query: Record<string, unknown> = { userId: auth.userId };
      const category = request.nextUrl.searchParams.get("category")?.trim() ?? "";
      const month = request.nextUrl.searchParams.get("month")?.trim() ?? "";

      if (category) query.category = category;
      if (month) query.month = month;

      const sortDirection = sortOrder === "asc" ? 1 : -1;
      const budgets = await BudgetModel.find(query)
        .sort({ createdAt: sortDirection, updatedAt: sortDirection })
        .lean();

      rows = [
        ["code", "category", "limit", "month", "year", "createdAt"],
        ...budgets.map((budget) => [
          budget.code ?? "",
          budget.category,
          String(budget.limit),
          budget.month,
          String(budget.year),
          budget.createdAt.toISOString(),
        ]),
      ];
      filename = `budgets${month ? `-${month}` : ""}.csv`;
    } else if (type === "users") {
      if (auth.role !== "admin") {
        return apiError("Forbidden", 403);
      }

      const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
      const query: Record<string, unknown> = { role: "user" };
      if (search) {
        query.$or = [
          { name: { $regex: escapeRegex(search), $options: "i" } },
          { email: { $regex: escapeRegex(search), $options: "i" } },
        ];
      }

      const sortDirection = sortOrder === "asc" ? 1 : -1;
      const users = await UserModel.find(query)
        .sort({ createdAt: sortDirection, _id: sortDirection })
        .lean();

      rows = [
        ["name", "email", "role", "createdAt"],
        ...users.map((user) => [user.name, user.email, user.role, user.createdAt.toISOString()]),
      ];
      filename = "users.csv";
    } else if (type === "budget-categories") {
      if (auth.role !== "admin") {
        return apiError("Forbidden", 403);
      }

      await ensureBudgetCategoriesSeeded();
      const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
      const query: Record<string, unknown> = {};
      if (search) {
        query.name = { $regex: escapeRegex(search), $options: "i" };
      }

      const sortDirection = sortOrder === "asc" ? 1 : -1;
      const [categories, expenseTotals, budgetTotals] = await Promise.all([
        BudgetCategoryModel.find(query).sort({ createdAt: sortDirection, _id: sortDirection }).lean(),
        ExpenseModel.aggregate([
          {
            $group: {
              _id: { $toLower: "$category" },
              total: { $sum: 1 },
            },
          },
        ]),
        BudgetModel.aggregate([
          {
            $group: {
              _id: { $toLower: "$category" },
              total: { $sum: 1 },
            },
          },
        ]),
      ]);

      const expenseMap = new Map(expenseTotals.map((item) => [String(item._id), Number(item.total ?? 0)]));
      const budgetMap = new Map(budgetTotals.map((item) => [String(item._id), Number(item.total ?? 0)]));

      rows = [
        ["name", "expenseCount", "budgetCount", "createdAt"],
        ...categories.map((category) => {
          const key = category.normalizedName || category.name.toLowerCase();
          return [
            category.name,
            String(expenseMap.get(key) ?? 0),
            String(budgetMap.get(key) ?? 0),
            category.createdAt.toISOString(),
          ];
        }),
      ];
      filename = "budget-categories.csv";
    } else {
      return apiError("Unsupported export type", 400);
    }

    const csv = toCsv(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to export CSV");
  }
}
