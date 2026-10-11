import { prisma } from "@/lib/db";
import { handle, readJson, requireAdmin } from "@/lib/http";
import { createEventSchema } from "@/lib/validation/event";

// GET /api/admin/events - every event, including inactive and past ones
export const GET = handle(async (request: Request) => {
  await requireAdmin(request);
  const events = await prisma.event.findMany({ orderBy: { startsAt: "desc" } });
  return Response.json({ events });
});

// POST /api/admin/events - create an event (active by default)
export const POST = handle(async (request: Request) => {
  await requireAdmin(request);
  const data = createEventSchema.parse(await readJson(request));
  const event = await prisma.event.create({ data });
  return Response.json({ event }, { status: 201 });
});
