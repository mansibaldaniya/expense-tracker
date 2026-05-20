import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { BudgetCategoryModel } from "@/models/BudgetCategory";
import { BudgetModel } from "@/models/Budget";
import { ExpenseModel } from "@/models/Expense";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeCategoryName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function toNormalizedKey(value: string) {
  return normalizeCategoryName(value).toLowerCase();
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth || auth.role !== "admin") {
      return apiError("Forbidden", 403);
    }

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return apiError("Invalid category id", 400);
    }

    const body = (await request.json()) as { name?: string };
    const name = normalizeCategoryName(String(body?.name ?? ""));
    if (!name) {
      return apiError("Category name is required", 400);
    }

    const existing = await BudgetCategoryModel.findById(id).lean();
    if (!existing) {
      return apiError("Category not found", 404);
    }

    const normalizedName = toNormalizedKey(name);
    const duplicate = await BudgetCategoryModel.findOne({
      normalizedName,
      _id: { $ne: id },
    }).lean();
    if (duplicate) {
      return apiError("Category name must be unique", 409);
    }

    const oldNameRegex = new RegExp(`^${escapeRegex(existing.name)}$`, "i");
    const updated = await BudgetCategoryModel.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          normalizedName,
        },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return apiError("Category not found", 404);
    }

    await Promise.all([
      ExpenseModel.updateMany({ category: oldNameRegex }, { $set: { category: name } }),
      BudgetModel.updateMany({ category: oldNameRegex }, { $set: { category: name } }),
    ]);

    return apiSuccess(
      {
        category: {
          id: updated._id.toString(),
          name: updated.name,
          normalizedName: updated.normalizedName,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        },
      },
      "Budget category updated"
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return apiError("Category name must be unique", 409);
    }
    return apiError(error instanceof Error ? error.message : "Unable to update category");
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth || auth.role !== "admin") {
      return apiError("Forbidden", 403);
    }

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return apiError("Invalid category id", 400);
    }

    const category = await BudgetCategoryModel.findById(id).lean();
    if (!category) {
      return apiError("Category not found", 404);
    }

    return apiSuccess(
      {
        category: {
          id: category._id.toString(),
          name: category.name,
          normalizedName: category.normalizedName,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        },
      },
      "Budget category loaded"
    );
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load category");
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth || auth.role !== "admin") {
      return apiError("Forbidden", 403);
    }

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return apiError("Invalid category id", 400);
    }

    const category = await BudgetCategoryModel.findById(id).lean();
    if (!category) {
      return apiError("Category not found", 404);
    }

    const expenseCount = await ExpenseModel.countDocuments({
      category: { $regex: `^${escapeRegex(category.name)}$`, $options: "i" },
    });

    if (expenseCount > 0) {
      return apiError("Category is in use by expenses and cannot be deleted", 409);
    }

    await BudgetCategoryModel.deleteOne({ _id: id });

    return apiSuccess({ deleted: true }, "Budget category deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to delete category");
  }
}
