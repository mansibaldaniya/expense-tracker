import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { getAuthTokenFromHeader, verifyAuthToken, type AuthTokenPayload } from "@/lib/auth";

export function getAuthFromRequest(request: NextRequest): AuthTokenPayload | null {
  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
  const headerToken = getAuthTokenFromHeader(request.headers.get("authorization"));
  return verifyAuthToken(cookieToken ?? headerToken ?? "");
}
