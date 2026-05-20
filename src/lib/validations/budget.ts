import { z } from "zod";

export const budgetSchema = z.object({
  category: z.string().trim().min(1, "Category is required"),
  limit: z.coerce.number().positive(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  year: z.coerce.number().int().min(2000).max(2100),
});

export const budgetQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  category: z.string().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
