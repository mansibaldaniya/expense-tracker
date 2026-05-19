export type ApiStatus = "success" | "error";

export type ApiResponse<T extends Record<string, unknown> = Record<string, never>> = {
  status: ApiStatus;
  message: string;
  data: T;
};

export type ExpenseInput = {
  amount: number;
  category: string;
  date: string;
  note?: string;
};

export type BudgetInput = {
  category: string;
  limit: number;
  month: string;
  year: number;
};

export type DashboardStats = {
  totalSpendingThisMonth: number;
  totalExpenses: number;
  highestCategory: string;
  budgetAlerts: number;
};
