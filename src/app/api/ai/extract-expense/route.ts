import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { AI_RATE_LIMIT } from "@/lib/constants";
import { rateLimit } from "@/lib/rate-limit";
import { aiExtractSchema } from "@/lib/validations/ai";
import { extractExpense } from "@/services/ai.service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return apiError("Unauthorized", 401);
    }

    const limitCheck = rateLimit(`ai:${auth.userId}`, AI_RATE_LIMIT.limit, AI_RATE_LIMIT.windowMs);
    if (!limitCheck.allowed) {
      return apiError("Too many AI requests. Please try again later.", 429);
    }

    const body = aiExtractSchema.parse(await request.json());
    const extracted = await extractExpense(body.text);
    return apiSuccess({ extracted }, "Expense extracted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to extract expense");
  }
}
