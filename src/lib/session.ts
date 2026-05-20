import { getAuthTokenFromCookies, verifyAuthToken, type AuthTokenPayload } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getUserById } from "@/services/auth.service";

export type ServerSessionUser = AuthTokenPayload & {
  name: string;
};

export async function getServerAuth(): Promise<AuthTokenPayload | null> {
  const token = await getAuthTokenFromCookies();
  return token ? verifyAuthToken(token) : null;
}

export async function getServerUser(): Promise<ServerSessionUser | null> {
  const auth = await getServerAuth();
  if (!auth) {
    return null;
  }

  await connectDB();
  const user = await getUserById(auth.userId);

  return {
    ...auth,
    name: user.name,
  };
}
