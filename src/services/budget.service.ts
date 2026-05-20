import mongoose from "mongoose";
import { BudgetModel } from "@/models/Budget";
import { budgetQuerySchema, budgetSchema } from "@/lib/validations/budget";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { createPublicId } from "@/lib/public-id";
import { BudgetInput } from "@/types";
import { budgetCategoryExists } from "@/services/budget-category.service";

export async function createBudget(userId: string, input: BudgetInput) {
  const payload = budgetSchema.parse(input);
  if (!(await budgetCategoryExists(payload.category))) {
    throw new Error("Category is not available");
  }
  const _id = new mongoose.Types.ObjectId();
  const budget = await BudgetModel.findOneAndUpdate(
    {
      userId,
      category: payload.category,
      month: payload.month,
      year: payload.year,
    },
    {
      $set: {
        category: payload.category,
        limit: payload.limit,
        month: payload.month,
        year: payload.year,
      },
      $setOnInsert: {
        _id,
        userId,
        code: createPublicId("BUDGET", _id.toString(), 6),
      },
    },
    { upsert: true, returnDocument: "after", new: true }
  );

  return budget;
}

export async function getBudgetById(userId: string, budgetId: string) {
  if (!mongoose.isValidObjectId(budgetId)) {
    throw new Error("Invalid budget id");
  }

  const budget = await BudgetModel.findOne({ _id: budgetId, userId }).lean();
  if (!budget) {
    throw new Error("Budget not found");
  }

  const code = budget.code ?? createPublicId("BUDGET", budget._id.toString(), 6);
  if (!budget.code) {
    await BudgetModel.updateOne({ _id: budget._id, userId }, { $set: { code } });
  }

  return {
    id: budget._id.toString(),
    code,
    category: budget.category,
    limit: budget.limit,
    month: budget.month,
    year: budget.year,
  };
}

export async function listBudgets(userId: string, searchParams: URLSearchParams) {
  const params = budgetQuerySchema.parse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? DEFAULT_PAGE_SIZE,
    category: searchParams.get("category") ?? undefined,
    month: searchParams.get("month") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
  });

  const page = params.page;
  const limit = params.limit;
  const skip = (page - 1) * limit;
  const query: Record<string, unknown> = { userId };
  if (params.category) query.category = params.category;
  if (params.month) query.month = params.month;
  const sortDirection = params.sortOrder === "asc" ? 1 : -1;

  const [budgets, total] = await Promise.all([
    BudgetModel.find(query).sort({ createdAt: sortDirection, updatedAt: sortDirection }).skip(skip).limit(limit).lean(),
    BudgetModel.countDocuments(query),
  ]);

  const missingCodes = budgets.filter((budget) => !budget.code);
  if (missingCodes.length > 0) {
    await BudgetModel.bulkWrite(
      missingCodes.map((budget) => ({
        updateOne: {
          filter: { _id: budget._id },
          update: { $set: { code: createPublicId("BUDGET", budget._id.toString(), 6) } },
        },
      }))
    );
  }

  return {
    budgets: budgets.map((budget) => ({
      id: budget._id.toString(),
      code: budget.code ?? createPublicId("BUDGET", budget._id.toString(), 6),
      category: budget.category,
      limit: budget.limit,
      month: budget.month,
      year: budget.year,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateBudget(userId: string, budgetId: string, input: BudgetInput) {
  if (!mongoose.isValidObjectId(budgetId)) {
    throw new Error("Invalid budget id");
  }

  const payload = budgetSchema.parse(input);
  if (!(await budgetCategoryExists(payload.category))) {
    throw new Error("Category is not available");
  }
  const existing = await BudgetModel.findOne({ _id: budgetId, userId }).lean();
  const budget = await BudgetModel.findOneAndUpdate(
    { _id: budgetId, userId },
    {
      category: payload.category,
      limit: payload.limit,
      month: payload.month,
      year: payload.year,
      code: existing?.code ?? createPublicId("BUDGET", budgetId, 6),
    },
    { returnDocument: "after" }
  );

  if (!budget) {
    throw new Error("Budget not found");
  }

  return budget;
}

export async function deleteBudget(userId: string, budgetId: string) {
  if (!mongoose.isValidObjectId(budgetId)) {
    throw new Error("Invalid budget id");
  }

  const budget = await BudgetModel.findOneAndDelete({ _id: budgetId, userId });
  if (!budget) {
    throw new Error("Budget not found");
  }

  return { deleted: true };
}
