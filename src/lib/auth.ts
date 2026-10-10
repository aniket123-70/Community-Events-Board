import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const AUTH_COOKIE = "token";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type Role = "USER" | "ADMIN";
export type AuthUser = { id: number; email: string; role: Role };

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_SECRET must be set and at least 32 characters");
  return new TextEncoder().encode(s);
}

export async function signToken(user: AuthUser) {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(secret());
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    const role = payload.role === "ADMIN" ? "ADMIN" : "USER";
    return { id: Number(payload.sub), email: String(payload.email), role };
  } catch {
    return null;
  }
}

/**
 * Reads the JWT from `Authorization: Bearer <token>` (mobile / API clients)
 * or from the httpOnly cookie (the web app). Same token either way.
 */
export async function getAuthUser(request?: Request): Promise<AuthUser | null> {
  const header = request?.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return verifyToken(header.slice(7));

  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: TOKEN_TTL_SECONDS,
};
