import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { verifyAuthToken } from "@/lib/auth";

const publicPaths = ["/", "/frontend", "/frontend/login", "/frontend/register", "/api/auth/login", "/api/auth/register", "/api/auth/logout", "/api/auth/me"];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
  const auth = token ? verifyAuthToken(token) : null;

  if (pathname.startsWith("/admin")) {
    if (!auth) {
      const loginUrl = new URL("/frontend/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (auth.role !== "admin") {
      return NextResponse.redirect(new URL("/frontend/dashboard?forbidden=1", request.url));
    }
  }

  if (pathname.startsWith("/frontend") && !isPublicPath(pathname)) {
    if (!auth) {
      const loginUrl = new URL("/frontend/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/frontend/:path*", "/api/:path*"],
};
