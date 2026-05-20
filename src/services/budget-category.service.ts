import { BudgetCategoryModel } from "@/models/BudgetCategory";

export const DEFAULT_BUDGET_CATEGORY_NAMES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Education",
  "Travel",
  "Rent",
  "Salary",
  "Other",
] as const;

export function normalizeBudgetCategoryName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeBudgetCategoryKey(value: string) {
  return normalizeBudgetCategoryName(value).toLowerCase();
}

export async function ensureBudgetCategoriesSeeded() {
  const existingCount = await BudgetCategoryModel.countDocuments();
  if (existingCount > 0) {
    return;
  }

  await BudgetCategoryModel.insertMany(
    DEFAULT_BUDGET_CATEGORY_NAMES.map((name) => ({
      name,
      normalizedName: normalizeBudgetCategoryKey(name),
    })),
    { ordered: false }
  );
}

export async function listBudgetCategoryNames() {
  await ensureBudgetCategoriesSeeded();
  const categories = await BudgetCategoryModel.find().sort({ name: 1 }).lean();
  return categories.map((category) => category.name);
}

export async function budgetCategoryExists(name: string) {
  await ensureBudgetCategoriesSeeded();
  const normalizedName = normalizeBudgetCategoryKey(name);
  const existing = await BudgetCategoryModel.findOne({ normalizedName }).lean();
  return Boolean(existing);
}

export async function findBudgetCategoryByName(name: string) {
  await ensureBudgetCategoriesSeeded();
  const normalizedName = normalizeBudgetCategoryKey(name);
  return BudgetCategoryModel.findOne({ normalizedName }).lean();
}
