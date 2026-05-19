import { z } from "zod";

export const aiExtractSchema = z.object({
  text: z.string().min(3).max(1000),
});
