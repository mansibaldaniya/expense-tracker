import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { loginUser } from "@/services/auth.service";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = (await request.json()) as unknown;
    const result = await loginUser(body);

    const response = apiSuccess({ user: result.user }, "Login successful");
    response.cookies.set(AUTH_COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Login failed");
  }
}
