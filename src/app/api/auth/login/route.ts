import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { handle, HttpError, readJson } from "@/lib/http";
import { sessionResponse } from "@/lib/session";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const POST = handle(async (request: Request) => {
  const { email, password } = loginSchema.parse(await readJson(request));

  const user = await prisma.user.findUnique({ where: { email } });
  // Same message for unknown email and wrong password so emails can't be probed
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, "Invalid email or password");
  }
  return sessionResponse(user);
});
