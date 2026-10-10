import "server-only";
import { prisma } from "./db";
import { AUTH_COOKIE, authCookieOptions, signToken, type Role } from "./auth";

/** Issues a JWT, returns it in the JSON body and also sets it as an httpOnly cookie for the web app. */
export async function sessionResponse(user: { id: number; email: string; role: string }, status = 200) {
  const role = user.role as Role;
  const token = await signToken({ id: user.id, email: user.email, role });
  const favourites = await prisma.favouriteCategory.findMany({
    where: { userId: user.id },
    select: { category: true },
  });

  const res = Response.json(
    {
      token,
      user: { id: user.id, email: user.email, role, favourites: favourites.map((f) => f.category) },
    },
    { status },
  );
  res.headers.append("Set-Cookie", serializeCookie(AUTH_COOKIE, token, authCookieOptions.maxAge));
  return res;
}

export function serializeCookie(name: string, value: string, maxAge: number) {
  const parts = [`${name}=${value}`, "Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${maxAge}`];
  if (authCookieOptions.secure) parts.push("Secure");
  return parts.join("; ");
}
