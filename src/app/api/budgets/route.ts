import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { createBudget, listBudgets } from "@/services/budget.service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return apiError("Unauthorized", 401);
    }

    const budgets = await listBudgets(auth.userId);
    return apiSuccess({ budgets }, "Budgets loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load budgets");
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return apiError("Unauthorized", 401);
    }

    const body = (await request.json()) as unknown;
    const budget = await createBudget(auth.userId, body as never);
    return apiSuccess({ budget }, "Budget created", 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to create budget");
  }
}
