import mongoose from "mongoose";
import { BudgetModel } from "@/models/Budget";
import { budgetSchema } from "@/lib/validations/budget";
import { BudgetInput } from "@/types";

export async function createBudget(userId: string, input: BudgetInput) {
  const payload = budgetSchema.parse(input);
  const budget = await BudgetModel.findOneAndUpdate(
    {
      userId,
      category: payload.category,
      month: payload.month,
      year: payload.year,
    },
    {
      userId,
      category: payload.category,
      limit: payload.limit,
      month: payload.month,
      year: payload.year,
    },
    { new: true, upsert: true }
  );

  return budget;
}

export async function listBudgets(userId: string) {
  const budgets = await BudgetModel.find({ userId }).sort({ year: -1, month: -1 }).lean();
  return budgets.map((budget) => ({
    id: budget._id.toString(),
    category: budget.category,
    limit: budget.limit,
    month: budget.month,
    year: budget.year,
  }));
}

export async function updateBudget(userId: string, budgetId: string, input: BudgetInput) {
  if (!mongoose.isValidObjectId(budgetId)) {
    throw new Error("Invalid budget id");
  }

  const payload = budgetSchema.parse(input);
  const budget = await BudgetModel.findOneAndUpdate(
    { _id: budgetId, userId },
    {
      category: payload.category,
      limit: payload.limit,
      month: payload.month,
      year: payload.year,
    },
    { new: true }
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
