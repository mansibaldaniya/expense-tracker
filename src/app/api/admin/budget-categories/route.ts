import { NextRequest } from "next/server";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { BudgetCategoryModel } from "@/models/BudgetCategory";
import { BudgetModel } from "@/models/Budget";
import { ExpenseModel } from "@/models/Expense";
import { ensureBudgetCategoriesSeeded } from "@/services/budget-category.service";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeCategoryName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function toNormalizedKey(value: string) {
  return normalizeCategoryName(value).toLowerCase();
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth || auth.role !== "admin") {
      return apiError("Forbidden", 403);
    }

    await ensureBudgetCategoriesSeeded();

    const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE)
    );
    const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
    const sortOrder = request.nextUrl.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (search) {
      query.name = { $regex: escapeRegex(search), $options: "i" };
    }

    const [categories, total, expenseTotals, budgetTotals] = await Promise.all([
      BudgetCategoryModel.find(query)
        .sort({ createdAt: sortOrder === "asc" ? 1 : -1, _id: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BudgetCategoryModel.countDocuments(query),
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

    const expenseMap = new Map(
      expenseTotals.map((item) => [String(item._id), Number(item.total ?? 0)])
    );
    const budgetMap = new Map(
      budgetTotals.map((item) => [String(item._id), Number(item.total ?? 0)])
    );

    return apiSuccess(
      {
        categories: categories.map((category) => {
          const key = category.normalizedName || category.name.toLowerCase();
          return {
            id: category._id.toString(),
            name: category.name,
            normalizedName: category.normalizedName,
            budgetCount: budgetMap.get(key) ?? 0,
            expenseCount: expenseMap.get(key) ?? 0,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
          };
        }),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
      "Budget categories loaded"
    );
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load budget categories");
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth || auth.role !== "admin") {
      return apiError("Forbidden", 403);
    }

    const body = (await request.json()) as { name?: string };
    const name = normalizeCategoryName(String(body?.name ?? ""));
    if (!name) {
      return apiError("Category name is required", 400);
    }

    const normalizedName = toNormalizedKey(name);
    const existing = await BudgetCategoryModel.findOne({ normalizedName }).lean();
    if (existing) {
      return apiError("Category name must be unique", 409);
    }

    const category = await BudgetCategoryModel.create({ name, normalizedName });
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
      "Budget category created",
      201
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return apiError("Category name must be unique", 409);
    }
    return apiError(error instanceof Error ? error.message : "Unable to create budget category");
  }
}
