import { unstable_rethrow } from "next/navigation";
import { ZodError } from "zod";
import { getAuthUser, type AuthUser } from "./auth";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function jsonError(status: number, message: string, details?: unknown) {
  return Response.json({ error: message, ...(details ? { details } : {}) }, { status });
}

/** Wraps a route handler so thrown HttpError / ZodError become JSON responses. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (err) {
      unstable_rethrow(err); // let Next.js internal signals (e.g. dynamic bail-out) through
      if (err instanceof HttpError) return jsonError(err.status, err.message);
      if (err instanceof ZodError) {
        return jsonError(400, err.issues[0]?.message ?? "Invalid input", err.issues);
      }
      console.error(err);
      return jsonError(500, "Something went wrong");
    }
  };
}

export async function requireUser(request: Request): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (!user) throw new HttpError(401, "Please log in");
  return user;
}

export async function requireAdmin(request: Request): Promise<AuthUser> {
  const user = await requireUser(request);
  if (user.role !== "ADMIN") throw new HttpError(403, "Admins only");
  return user;
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Request body must be JSON");
  }
}
