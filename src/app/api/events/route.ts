import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { buildEventsWhere, eventFiltersSchema, publicEventSelect, withReminded } from "@/lib/events";
import { handle } from "@/lib/http";

// GET /api/events?category=Music&city=Coimbatore&q=night&page=1
export const GET = handle(async (request: Request) => {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const filters = eventFiltersSchema.parse(params);
  const where = buildEventsWhere(filters);

  const [total, events] = await prisma.$transaction([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      select: publicEventSelect,
      orderBy: { startsAt: "asc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
  ]);

  const user = await getAuthUser(request);

  return Response.json({
    events: await withReminded(events, user?.id),
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    },
  });
});
