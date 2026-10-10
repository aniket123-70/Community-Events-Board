import { AUTH_COOKIE } from "@/lib/auth";
import { serializeCookie } from "@/lib/session";

export async function POST() {
  const res = Response.json({ ok: true });
  res.headers.append("Set-Cookie", serializeCookie(AUTH_COOKIE, "", 0));
  return res;
}
