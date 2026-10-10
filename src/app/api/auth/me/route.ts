import { prisma } from "@/lib/db";
import { handle, requireUser } from "@/lib/http";

export const GET = handle(async (request: Request) => {
  const auth = await requireUser(request);
  const favourites = await prisma.favouriteCategory.findMany({
    where: { userId: auth.id },
    select: { category: true },
  });
  return Response.json({ user: { ...auth, favourites: favourites.map((f) => f.category) } });
});
