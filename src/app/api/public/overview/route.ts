import { connectDB } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { UserModel } from "@/models/User";
import { ExpenseModel } from "@/models/Expense";
import { BudgetModel } from "@/models/Budget";

export async function GET() {
  try {
    await connectDB();

    const [totalUsers, totalExpenses, totalBudgets, recentExpenses] = await Promise.all([
      UserModel.countDocuments({ role: "user" }),
      ExpenseModel.countDocuments(),
      BudgetModel.countDocuments(),
      ExpenseModel.find().sort({ createdAt: -1 }).limit(3).lean(),
    ]);

    return apiSuccess(
      {
        totals: {
          users: totalUsers,
          expenses: totalExpenses,
          budgets: totalBudgets,
        },
        recentExpenses: recentExpenses.map((expense) => ({
          id: expense._id.toString(),
          category: expense.category,
          amount: expense.amount,
          date: expense.date,
        })),
      },
      "Public overview loaded"
    );
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load public overview");
  }
}
