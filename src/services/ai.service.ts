import { ExtractedExpense, extractExpenseWithGemini } from "@/lib/gemini";

export async function extractExpense(text: string): Promise<ExtractedExpense> {
  return extractExpenseWithGemini(text);
}
