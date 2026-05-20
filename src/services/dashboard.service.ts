import mongoose from "mongoose";
import { ExpenseModel } from "@/models/Expense";
import { BudgetModel } from "@/models/Budget";
import { UserModel } from "@/models/User";

const objectId = (userId: string) => new mongoose.Types.ObjectId(userId);
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildCurrentYearSeries(values: Map<string, number>) {
  const now = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const key = `${now.getFullYear()}-${String(index + 1).padStart(2, "0")}`;
    return {
      month: monthLabels[index],
      total: values.get(key) ?? 0,
    };
  });
}

function parseMonthInput(value?: string | null) {
  const fallback = new Date();
  if (!value) {
    return {
      year: fallback.getFullYear(),
      month: fallback.getMonth() + 1,
      monthKey: `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, "0")}`,
    };
  }

  const [yearText, monthText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return {
      year: fallback.getFullYear(),
      month: fallback.getMonth() + 1,
      monthKey: `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, "0")}`,
    };
  }

  return {
    year,
    month,
    monthKey: `${year}-${String(month).padStart(2, "0")}`,
  };
}

export async function getUserDashboard(userId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const [monthSummary, lifetimeSummary, recentExpenses, categoryBreakdown, yearTrend, budgets, totalBudgets] = await Promise.all([
    ExpenseModel.aggregate([
      { $match: { userId: objectId(userId), date: { $gte: monthStart, $lt: nextMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    ExpenseModel.aggregate([
      { $match: { userId: objectId(userId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
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
          date: {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lt: new Date(now.getFullYear() + 1, 0, 1),
          },
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
    BudgetModel.countDocuments({ userId }),
  ]);

  const totalExpenseAmount = lifetimeSummary[0]?.total ?? 0;
  const totalExpenses = await ExpenseModel.countDocuments({ userId });
  const highestCategory = categoryBreakdown[0]?._id ?? "Other";
  const rollingTotals = new Map<string, number>();
  yearTrend.forEach((item) => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
    rollingTotals.set(key, item.total);
  });

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
      totalExpenseAmount,
      totalSpendingThisMonth: monthSummary[0]?.total ?? 0,
      totalExpenses,
      highestCategory,
      totalBudgets,
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
    trend: buildCurrentYearSeries(rollingTotals),
    budgetAlerts: alerts,
  };
}

export async function getAdminDashboard(month?: string | null) {
  const now = new Date();
  const selectedMonth = parseMonthInput(month);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const nextYear = new Date(now.getFullYear() + 1, 0, 1);
  const yearMonthKeys = monthLabels.map((_, index) => `${now.getFullYear()}-${String(index + 1).padStart(2, "0")}`);

  const [totalUsers, totalExpenses, totalBudgets, recentUsers, recentExpenses, monthlyUsers, monthlyExpenses] =
    await Promise.all([
      UserModel.countDocuments({ role: "user" }),
      ExpenseModel.countDocuments(),
      BudgetModel.countDocuments(),
      UserModel.find({ role: "user" }).sort({ createdAt: -1 }).limit(5).lean(),
      ExpenseModel.find().sort({ createdAt: -1 }).limit(5).lean(),
      UserModel.aggregate([
        {
          $match: {
            role: "user",
            createdAt: {
              $gte: yearStart,
              $lt: nextYear,
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      ExpenseModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: yearStart,
              $lt: nextYear,
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

  const selectedMonthBudgets = await BudgetModel.find({ month: selectedMonth.monthKey }).lean();
  const currentMonthExpenses = await ExpenseModel.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(selectedMonth.year, selectedMonth.month - 1, 1),
          $lt: new Date(selectedMonth.year, selectedMonth.month, 1),
        },
      },
    },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
  ]);

  const userSeriesMap = new Map(
    monthlyUsers.map((item) => [`${item._id.year}-${String(item._id.month).padStart(2, "0")}`, item.total as number])
  );
  const expenseSeriesMap = new Map(
    monthlyExpenses.map((item) => [`${item._id.year}-${String(item._id.month).padStart(2, "0")}`, item.total as number])
  );

  const alertByCategory = new Map(
    currentMonthExpenses.map((item) => [item._id as string, item.total as number])
  );
  const alerts = selectedMonthBudgets.map((budget) => {
    const spent = alertByCategory.get(budget.category) ?? 0;
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
    totalUsers,
    totalExpenses,
    totalBudgets,
    totalBudgetAlerts: alerts.filter((item) => item.status !== "safe").length,
    categoryBreakdown: currentMonthExpenses
      .map((item) => ({
        name: item._id as string,
        value: item.total as number,
      }))
      .sort((a, b) => b.value - a.value),
    monthlyUsers: yearMonthKeys.map((key, index) => ({
      month: monthLabels[index],
      total: userSeriesMap.get(key) ?? 0,
    })),
    monthlyExpenses: yearMonthKeys.map((key, index) => ({
      month: monthLabels[index],
      total: expenseSeriesMap.get(key) ?? 0,
    })),
    budgetAlerts: alerts,
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

export async function getAdminUserDetails(userId: string, month?: string | null) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user id");
  }

  const selectedMonth = parseMonthInput(month);
  const user = await UserModel.findById(userId).lean();
  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "user") {
    throw new Error("Only user accounts can be viewed here");
  }

  const [budgets, expenses, totalBudgets, totalExpenses, totalExpenseAmount] = await Promise.all([
    BudgetModel.find({ userId, month: selectedMonth.monthKey }).sort({ category: 1 }).lean(),
    ExpenseModel.find({
      userId,
      date: {
        $gte: new Date(selectedMonth.year, selectedMonth.month - 1, 1),
        $lt: new Date(selectedMonth.year, selectedMonth.month, 1),
      },
    })
      .sort({ date: -1, createdAt: -1 })
      .lean(),
    BudgetModel.countDocuments({ userId }),
    ExpenseModel.countDocuments({ userId }),
    ExpenseModel.aggregate([
      { $match: { userId: objectId(userId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const expenseTotalsByCategory = new Map<string, number>();
  expenses.forEach((expense) => {
    expenseTotalsByCategory.set(expense.category, (expenseTotalsByCategory.get(expense.category) ?? 0) + expense.amount);
  });

  const alerts = budgets.map((budget) => {
    const spent = expenseTotalsByCategory.get(budget.category) ?? 0;
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
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    month: selectedMonth.monthKey,
    summary: {
      totalBudgets,
      totalExpenses,
      totalExpenseAmount: totalExpenseAmount[0]?.total ?? 0,
      totalAlerts: alerts.filter((alert) => alert.status !== "safe").length,
    },
    budgets: budgets.map((budget) => {
      const spent = expenseTotalsByCategory.get(budget.category) ?? 0;
      const percent = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      return {
        id: budget._id.toString(),
        code: budget.code,
        category: budget.category,
        limit: budget.limit,
        month: budget.month,
        year: budget.year,
        spent,
        percent,
        status: percent >= 100 ? "danger" : percent >= 80 ? "warning" : "safe",
      };
    }),
    expenses: expenses.map((expense) => ({
      id: expense._id.toString(),
      code: expense.code,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      note: expense.note,
    })),
    alerts,
  };
}

export async function deleteAdminUserAccount(userId: string) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user id");
  }

  const user = await UserModel.findById(userId).lean();
  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "user") {
    throw new Error("Admin accounts cannot be deleted from this screen");
  }

  await Promise.all([
    BudgetModel.deleteMany({ userId }),
    ExpenseModel.deleteMany({ userId }),
    UserModel.deleteOne({ _id: userId }),
  ]);

  return { deleted: true };
}
