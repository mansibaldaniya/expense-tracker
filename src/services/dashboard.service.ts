import mongoose from "mongoose";
import { ExpenseModel } from "@/models/Expense";
import { BudgetModel } from "@/models/Budget";
import { UserModel } from "@/models/User";

const objectId = (userId: string) => new mongoose.Types.ObjectId(userId);

export async function getUserDashboard(userId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [summary, recentExpenses, categoryBreakdown, trend, budgets] = await Promise.all([
    ExpenseModel.aggregate([
      { $match: { userId: objectId(userId), date: { $gte: monthStart, $lt: nextMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    ExpenseModel.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(5).lean(),
    ExpenseModel.aggregate([
      { $match: { userId: objectId(userId), date: { $gte: monthStart, $lt: nextMonth } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]),
    ExpenseModel.aggregate([
      {
        $match: {
          userId: objectId(userId),
          date: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    BudgetModel.find({ userId, month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}` }).lean(),
  ]);

  const totalSpendingThisMonth = summary[0]?.total ?? 0;
  const totalExpenses = await ExpenseModel.countDocuments({ userId });
  const highestCategory = categoryBreakdown[0]?._id ?? "Other";

  const alerts = budgets.map((budget) => {
    const spent = categoryBreakdown.find((item) => item._id === budget.category)?.total ?? 0;
    const percent = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
    return {
      budgetId: budget._id.toString(),
      category: budget.category,
      spent,
      limit: budget.limit,
      percent,
      status: percent >= 100 ? "danger" : percent >= 80 ? "warning" : "safe",
    };
  });

  return {
    summary: {
      totalSpendingThisMonth,
      totalExpenses,
      highestCategory,
      budgetAlerts: alerts.filter((alert) => alert.status !== "safe").length,
    },
    recentExpenses: recentExpenses.map((expense) => ({
      id: expense._id.toString(),
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      note: expense.note,
    })),
    categoryBreakdown: categoryBreakdown.map((item) => ({
      name: item._id,
      value: item.total,
    })),
    trend: trend.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      total: item.total,
    })),
    budgetAlerts: alerts,
  };
}

export async function getAdminDashboard() {
  const [totalUsers, totalExpenses, recentUsers, recentExpenses] = await Promise.all([
    UserModel.countDocuments(),
    ExpenseModel.countDocuments(),
    UserModel.find().sort({ createdAt: -1 }).limit(5).lean(),
    ExpenseModel.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  return {
    totalUsers,
    totalExpenses,
    recentUsers: recentUsers.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    })),
    recentExpenses: recentExpenses.map((expense) => ({
      id: expense._id.toString(),
      amount: expense.amount,
      category: expense.category,
      note: expense.note,
    })),
  };
}
