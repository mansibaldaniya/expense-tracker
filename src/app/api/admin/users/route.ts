import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { UserModel } from "@/models/User";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth || auth.role !== "admin") {
      return apiError("Forbidden", 403);
    }

    const users = await UserModel.find().sort({ createdAt: -1 }).lean();
    return apiSuccess(
      {
        users: users.map((user) => ({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        })),
      },
      "Users loaded"
    );
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load users");
  }
}
