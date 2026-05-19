import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { getUserDashboard } from "@/services/dashboard.service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return apiError("Unauthorized", 401);
    }

    const dashboard = await getUserDashboard(auth.userId);
    return apiSuccess(dashboard, "Dashboard loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load dashboard");
  }
}
