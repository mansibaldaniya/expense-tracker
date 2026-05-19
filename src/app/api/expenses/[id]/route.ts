import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { deleteExpense, updateExpense } from "@/services/expense.service";
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
    const expense = await updateExpense(auth.userId, id, body as never);
    return apiSuccess({ expense }, "Expense updated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to update expense");
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
    const result = await deleteExpense(auth.userId, id);
    return apiSuccess(result, "Expense deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to delete expense");
  }
}
