import mongoose from "mongoose";
import { ExpenseModel } from "@/models/Expense";
import { expenseQuerySchema, expenseSchema } from "@/lib/validations/expense";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { createPublicId } from "@/lib/public-id";
import { ExpenseInput } from "@/types";
import { budgetCategoryExists } from "@/services/budget-category.service";

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
  if (!(await budgetCategoryExists(payload.category))) {
    throw new Error("Category is not available");
  }
  const _id = new mongoose.Types.ObjectId();
  const expense = await ExpenseModel.create({
    _id,
    userId,
    code: createPublicId("EXP", _id.toString(), 4),
    amount: payload.amount,
    category: payload.category,
    date: new Date(payload.date),
    note: payload.note ?? "",
  });

  return expense;
}

export async function getExpenseById(userId: string, expenseId: string) {
  if (!mongoose.isValidObjectId(expenseId)) {
    throw new Error("Invalid expense id");
  }

  const expense = await ExpenseModel.findOne({ _id: expenseId, userId }).lean();
  if (!expense) {
    throw new Error("Expense not found");
  }

  const code = expense.code ?? createPublicId("EXP", expense._id.toString(), 4);
  if (!expense.code) {
    await ExpenseModel.updateOne({ _id: expense._id, userId }, { $set: { code } });
  }

  return {
    id: expense._id.toString(),
    code,
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    note: expense.note,
  };
}

export async function listExpenses(userId: string, searchParams: URLSearchParams) {
  const params = expenseQuerySchema.parse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? DEFAULT_PAGE_SIZE,
    category: searchParams.get("category") ?? undefined,
    month: searchParams.get("month") ?? undefined,
    date: searchParams.get("date") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
  });

  const query: Record<string, unknown> = { userId };
  if (params.category) query.category = params.category;
  Object.assign(query, toDateRange(params.month, params.date));
  if (params.search) {
    query.note = { $regex: params.search, $options: "i" };
  }

  const sortDirection = params.sortOrder === "asc" ? 1 : -1;
  const sortField = params.sortBy ?? "createdAt";
  const sort =
    sortField === "date"
      ? ({ date: sortDirection, createdAt: -1 } as const)
      : ({ createdAt: sortDirection, date: -1 } as const);
  const skip = (params.page - 1) * params.limit;
  const [items, total] = await Promise.all([
    ExpenseModel.find(query).sort(sort).skip(skip).limit(params.limit).lean(),
    ExpenseModel.countDocuments(query),
  ]);

  const missingCodes = items.filter((expense) => !expense.code);
  if (missingCodes.length > 0) {
    await ExpenseModel.bulkWrite(
      missingCodes.map((expense) => ({
        updateOne: {
          filter: { _id: expense._id },
          update: { $set: { code: createPublicId("EXP", expense._id.toString(), 4) } },
        },
      }))
    );
  }

  return {
    items: items.map((expense) => ({
      id: expense._id.toString(),
      code: expense.code ?? createPublicId("EXP", expense._id.toString(), 4),
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
  if (!(await budgetCategoryExists(payload.category))) {
    throw new Error("Category is not available");
  }
  const existing = await ExpenseModel.findOne({ _id: expenseId, userId }).lean();
  const expense = await ExpenseModel.findOneAndUpdate(
    { _id: expenseId, userId },
    {
      amount: payload.amount,
      category: payload.category,
      date: new Date(payload.date),
      note: payload.note ?? "",
      code: existing?.code ?? createPublicId("EXP", expenseId, 4),
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
