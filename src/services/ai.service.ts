import { ExtractedExpense, extractExpenseWithGemini, extractExpenseWithGeminiFromFile } from "@/lib/gemini";

export async function extractExpense(text: string, allowedCategories: string[] = []): Promise<ExtractedExpense> {
  return extractExpenseWithGemini(text, allowedCategories);
}

export async function extractExpenseFromFile(
  input: {
    buffer: Buffer;
    mimeType: string;
    fileName: string;
  },
  allowedCategories: string[] = []
): Promise<ExtractedExpense> {
  return extractExpenseWithGeminiFromFile({ ...input, allowedCategories });
}
