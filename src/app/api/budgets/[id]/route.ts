import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { deleteBudget, getBudgetById, updateBudget } from "@/services/budget.service";
import { apiError, apiSuccess } from "@/lib/api-response";

type Params = {
  id: string;
};

export async function PUT(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return apiError("Unauthorized", 401);
    }

    const body = (await request.json()) as unknown;
    const { id } = await context.params;
    const budget = await updateBudget(auth.userId, id, body as never);
    return apiSuccess({ budget }, "Budget updated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to update budget");
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return apiError("Unauthorized", 401);
    }

    const { id } = await context.params;
    const budget = await getBudgetById(auth.userId, id);
    return apiSuccess({ budget }, "Budget loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load budget");
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return apiError("Unauthorized", 401);
    }

    const { id } = await context.params;
    const result = await deleteBudget(auth.userId, id);
    return apiSuccess(result, "Budget deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to delete budget");
  }
}
