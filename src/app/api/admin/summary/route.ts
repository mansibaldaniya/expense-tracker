import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { getAdminDashboard } from "@/services/dashboard.service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth || auth.role !== "admin") {
      return apiError("Forbidden", 403);
    }

    const summary = await getAdminDashboard();
    return apiSuccess(summary, "Admin summary loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load admin summary");
  }
}
