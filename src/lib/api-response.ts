import { NextResponse } from "next/server";

export type ApiStatus = "success" | "error";

export type ApiResponse<T extends Record<string, unknown> = Record<string, never>> = {
  status: ApiStatus;
  message: string;
  data: T;
};

export function apiSuccess<T extends Record<string, unknown>>(
  data: T,
  message = "OK",
  status = 200
) {
  return NextResponse.json<ApiResponse<T>>(
    {
      status: "success",
      message,
      data,
    },
    { status }
  );
}

export function apiError(message: string, status = 400, data: Record<string, never> = {}) {
  return NextResponse.json<ApiResponse<Record<string, never>>>(
    {
      status: "error",
      message,
      data,
    },
    { status }
  );
}
