import { z } from "zod";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

export const budgetSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  limit: z.coerce.number().positive(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  year: z.coerce.number().int().min(2000).max(2100),
});
