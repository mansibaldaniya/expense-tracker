import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { getUserById } from "@/services/auth.service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);

    if (!auth) {
      return apiError("Unauthorized", 401);
    }

    const user = await getUserById(auth.userId);
    return apiSuccess({ user }, "Current user loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load user");
  }
}
