import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { changePassword } from "@/services/auth.service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return apiError("Unauthorized", 401);
    }

    const body = (await request.json()) as unknown;
    await changePassword(auth.userId, body);
    return apiSuccess({}, "Password updated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to update password");
  }
}
