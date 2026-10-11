import { z } from "zod";
import { CATEGORIES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { handle, readJson, requireUser } from "@/lib/http";

const favouritesSchema = z.object({
  categories: z.array(z.enum(CATEGORIES, { error: "Unknown category" })).max(CATEGORIES.length),
});

export const GET = handle(async (request: Request) => {
  const user = await requireUser(request);
  const rows = await prisma.favouriteCategory.findMany({ where: { userId: user.id }, select: { category: true } });
  return Response.json({ categories: rows.map((r) => r.category) });
});

// PUT /api/me/favourites { categories: ["Music", "Food"] } - replaces the whole list
export const PUT = handle(async (request: Request) => {
  const user = await requireUser(request);
  const categories = [...new Set(favouritesSchema.parse(await readJson(request)).categories)];

  await prisma.$transaction([
    prisma.favouriteCategory.deleteMany({ where: { userId: user.id } }),
    prisma.favouriteCategory.createMany({ data: categories.map((category) => ({ userId: user.id, category })) }),
  ]);
  return Response.json({ categories });
});
