import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { ExpenseModel } from "@/models/Expense";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth || auth.role !== "admin") {
      return apiError("Forbidden", 403);
    }

    const spending = await ExpenseModel.aggregate([
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    return apiSuccess(
      {
        analytics: spending.map((item) => ({ category: item._id, total: item.total })),
      },
      "Analytics loaded"
    );
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load analytics");
  }
}
