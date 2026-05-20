import { GoogleGenerativeAI } from "@google/generative-ai";

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Please define the GEMINI_API_KEY environment variable");
  }
  return new GoogleGenerativeAI(apiKey);
}

function getGeminiModelName(): string {
  return process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
}

function extractJson(text: string): string {
  const codeFenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeFenceMatch?.[1]) {
    return codeFenceMatch[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return text.trim();
}

export type ExtractedExpense = {
  amount: number;
  category: string;
  date: string;
  note: string;
};

function buildExpensePrompt(context: string): string {
  return `
You are an expense extraction engine.
Extract the expense details from the input and return ONLY valid JSON.

Rules:
- amount must be a number.
- category must be one of: Food, Transport, Shopping, Bills, Health, Entertainment, Education, Travel, Rent, Salary, Other.
- date must be in YYYY-MM-DD format. If relative words are used, infer the most likely date from the input. If no date is present, use today's date.
- note should be a short merchant or description string.

Return JSON in this shape:
{
  "amount": 450,
  "category": "Food",
  "date": "2026-05-18",
  "note": "Starbucks"
}

Input:
${context}
`.trim();
}

function toExpenseOutput(parsed: ExtractedExpense): ExtractedExpense {
  return {
    amount: Number(parsed.amount),
    category: String(parsed.category),
    date: String(parsed.date),
    note: String(parsed.note),
  };
}

export async function extractExpenseWithGemini(
  text: string
): Promise<ExtractedExpense> {
  const model = getGeminiClient().getGenerativeModel({
    model: getGeminiModelName(),
  });

  const prompt = buildExpensePrompt(text);

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  const parsed = JSON.parse(extractJson(responseText)) as ExtractedExpense;

  return toExpenseOutput(parsed);
}

export async function extractExpenseWithGeminiFromFile(input: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}): Promise<ExtractedExpense> {
  const model = getGeminiClient().getGenerativeModel({
    model: getGeminiModelName(),
  });

  const result = await model.generateContent([
    buildExpensePrompt(
      `File name: ${input.fileName}\nMime type: ${input.mimeType}\nThe attached file contains the expense information.`
    ),
    {
      inlineData: {
        data: input.buffer.toString("base64"),
        mimeType: input.mimeType,
      },
    },
  ]);

  const responseText = result.response.text();
  const parsed = JSON.parse(extractJson(responseText)) as ExtractedExpense;

  return toExpenseOutput(parsed);
}
