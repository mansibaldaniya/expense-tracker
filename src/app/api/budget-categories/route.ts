import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { listBudgetCategoryNames } from "@/services/budget-category.service";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return apiError("Unauthorized", 401);
    }

    const categories = await listBudgetCategoryNames();
    return apiSuccess(
      {
        categories: categories.map((name) => ({ name })),
      },
      "Budget categories loaded"
    );
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load budget categories");
  }
}
