import { prisma } from "@/lib/db";
import { visibleEventsWhere } from "@/lib/events";
import { handle } from "@/lib/http";

// Cities that currently have something to show, for the city filter dropdown
export const GET = handle(async () => {
  const rows = await prisma.event.findMany({
    where: visibleEventsWhere(),
    distinct: ["city"],
    select: { city: true },
    orderBy: { city: "asc" },
  });
  return Response.json({ cities: rows.map((r) => r.city) });
});
