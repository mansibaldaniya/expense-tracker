import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/request-auth";
import { UserModel } from "@/models/User";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth || auth.role !== "admin") {
      return apiError("Forbidden", 403);
    }

    const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE)
    );
    const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
    const sortOrder = request.nextUrl.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = { role: "user" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .sort({ createdAt: sortOrder === "asc" ? 1 : -1, _id: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(query),
    ]);
    return apiSuccess(
      {
        users: users.map((user) => ({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Users loaded"
    );
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load users");
  }
}
