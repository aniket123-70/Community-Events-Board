import { prisma } from "@/lib/db";
import { eventFiltersSchema, publicEventSelect, visibleEventsWhere, withReminded } from "@/lib/events";
import { handle, requireUser } from "@/lib/http";

// GET /api/me/feed?page=1 - upcoming active events in the user's favourite categories
export const GET = handle(async (request: Request) => {
  const user = await requireUser(request);
  const { page, pageSize } = eventFiltersSchema.parse(Object.fromEntries(new URL(request.url).searchParams));

  const favourites = await prisma.favouriteCategory.findMany({ where: { userId: user.id }, select: { category: true } });
  const categories = favourites.map((f) => f.category);
  const where = { ...visibleEventsWhere(), category: { in: categories } };

  const [total, events] = await prisma.$transaction([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      select: publicEventSelect,
      orderBy: { startsAt: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return Response.json({
    categories,
    events: await withReminded(events, user.id),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
});
