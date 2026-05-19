import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { createExpense, listExpenses } from "@/services/expense.service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return apiError("Unauthorized", 401);
    }

    const data = await listExpenses(auth.userId, request.nextUrl.searchParams);
    return apiSuccess(data, "Expenses loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load expenses");
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
    const expense = await createExpense(auth.userId, body as never);
    return apiSuccess({ expense }, "Expense created", 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to create expense");
  }
}
