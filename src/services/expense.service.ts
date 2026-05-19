import mongoose from "mongoose";
import { ExpenseModel } from "@/models/Expense";
import { expenseQuerySchema, expenseSchema } from "@/lib/validations/expense";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { ExpenseInput } from "@/types";

function toDateRange(month?: string, date?: string): Record<string, Date | string> {
  if (date) {
    return { date: new Date(date) };
  }

  if (month) {
    const [year, monthIndex] = month.split("-").map(Number);
    const start = new Date(year, monthIndex - 1, 1);
    const end = new Date(year, monthIndex, 1);
    return { date: { $gte: start, $lt: end } as unknown as Date };
  }

  return {};
}

export async function createExpense(userId: string, input: ExpenseInput) {
  const payload = expenseSchema.parse(input);
  const expense = await ExpenseModel.create({
    userId,
    amount: payload.amount,
    category: payload.category,
    date: new Date(payload.date),
    note: payload.note ?? "",
  });

  return expense;
}

export async function listExpenses(userId: string, searchParams: URLSearchParams) {
  const params = expenseQuerySchema.parse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? DEFAULT_PAGE_SIZE,
    category: searchParams.get("category") ?? undefined,
    month: searchParams.get("month") ?? undefined,
    date: searchParams.get("date") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  });

  const query: Record<string, unknown> = { userId };
  if (params.category) query.category = params.category;
  Object.assign(query, toDateRange(params.month, params.date));
  if (params.search) {
    query.note = { $regex: params.search, $options: "i" };
  }

  const skip = (params.page - 1) * params.limit;
  const [items, total] = await Promise.all([
    ExpenseModel.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(params.limit)
      .lean(),
    ExpenseModel.countDocuments(query),
  ]);

  return {
    items: items.map((expense) => ({
      id: expense._id.toString(),
      userId: expense.userId.toString(),
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      note: expense.note,
      createdAt: expense.createdAt,
    })),
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}

export async function updateExpense(
  userId: string,
  expenseId: string,
  input: ExpenseInput
) {
  if (!mongoose.isValidObjectId(expenseId)) {
    throw new Error("Invalid expense id");
  }

  const payload = expenseSchema.parse(input);
  const expense = await ExpenseModel.findOneAndUpdate(
    { _id: expenseId, userId },
    {
      amount: payload.amount,
      category: payload.category,
      date: new Date(payload.date),
      note: payload.note ?? "",
    },
    { new: true }
  );

  if (!expense) {
    throw new Error("Expense not found");
  }

  return expense;
}

export async function deleteExpense(userId: string, expenseId: string) {
  if (!mongoose.isValidObjectId(expenseId)) {
    throw new Error("Invalid expense id");
  }

  const expense = await ExpenseModel.findOneAndDelete({ _id: expenseId, userId });
  if (!expense) {
    throw new Error("Expense not found");
  }

  return { deleted: true };
}
