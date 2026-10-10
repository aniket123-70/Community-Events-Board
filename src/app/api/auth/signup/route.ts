import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { handle, HttpError, readJson } from "@/lib/http";
import { sessionResponse } from "@/lib/session";
import { credentialsSchema } from "@/lib/validation/auth";

export const POST = handle(async (request: Request) => {
  const { email, password } = credentialsSchema.parse(await readJson(request));

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, "An account with this email already exists");

  const user = await prisma.user.create({
    data: { email, passwordHash: await bcrypt.hash(password, 10) },
  });
  return sessionResponse(user, 201);
});
