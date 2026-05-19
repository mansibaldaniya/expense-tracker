export const APP_NAME = "AI Expense Tracker";

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Education",
  "Travel",
  "Rent",
  "Salary",
  "Other",
] as const;

export const DEFAULT_PAGE_SIZE = 10;

export const AUTH_COOKIE_NAME = "expense_tracker_token";

export const AI_RATE_LIMIT = {
  limit: 10,
  windowMs: 60 * 1000,
} as const;
