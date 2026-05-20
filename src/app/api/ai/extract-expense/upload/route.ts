import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { extractExpenseWithGeminiFromFile } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return apiError("Unauthorized", 401);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return apiError("File is required");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extracted = await extractExpenseWithGeminiFromFile({
      buffer,
      mimeType: file.type || "application/octet-stream",
      fileName: file.name,
    });

    return apiSuccess({ extracted }, "Expense extracted from file");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to extract expense from file");
  }
}
