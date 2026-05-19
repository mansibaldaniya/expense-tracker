import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { ExpenseModel } from "@/models/Expense";
import { apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return apiError("Unauthorized", 401);
    }

    const month = request.nextUrl.searchParams.get("month");
    const query: Record<string, unknown> = { userId: auth.userId };

    if (month) {
      const [year, monthIndex] = month.split("-").map(Number);
      query.date = {
        $gte: new Date(year, monthIndex - 1, 1),
        $lt: new Date(year, monthIndex, 1),
      };
    }

    const expenses = await ExpenseModel.find(query).sort({ date: -1 }).lean();
    const csvRows = [
      ["date", "category", "amount", "note"],
      ...expenses.map((expense) => [
        expense.date.toISOString().slice(0, 10),
        expense.category,
        String(expense.amount),
        expense.note.replaceAll('"', '""'),
      ]),
    ];

    const csv = csvRows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="expenses${month ? `-${month}` : ""}.csv"`,
      },
    });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to export CSV");
  }
}
