import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { deleteAdminUserAccount, getAdminUserDetails } from "@/services/dashboard.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth || auth.role !== "admin") {
      return apiError("Forbidden", 403);
    }

    const { id } = await context.params;
    const month = request.nextUrl.searchParams.get("month");
    const details = await getAdminUserDetails(id, month);
    return apiSuccess(details, "User details loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load user details");
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth || auth.role !== "admin") {
      return apiError("Forbidden", 403);
    }

    const { id } = await context.params;
    const result = await deleteAdminUserAccount(id);
    return apiSuccess(result, "User deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to delete user");
  }
}
