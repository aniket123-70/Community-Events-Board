import { prisma } from "@/lib/db";
import { visibleEventsWhere } from "@/lib/events";
import { handle, HttpError, requireUser } from "@/lib/http";

type Ctx = RouteContext<"/api/me/reminders/[eventId]">;

async function eventIdFrom(ctx: Ctx) {
  const id = Number((await ctx.params).eventId);
  if (!Number.isInteger(id)) throw new HttpError(404, "Event not found");
  return id;
}

// PUT /api/me/reminders/:eventId - idempotent, safe to retry
export const PUT = handle(async (request: Request, ctx: Ctx) => {
  const user = await requireUser(request);
  const eventId = await eventIdFrom(ctx);

  const event = await prisma.event.findFirst({ where: { id: eventId, ...visibleEventsWhere() }, select: { id: true } });
  if (!event) throw new HttpError(404, "This event is no longer available");

  await prisma.reminder.upsert({
    where: { userId_eventId: { userId: user.id, eventId } },
    update: {},
    create: { userId: user.id, eventId },
  });
  return Response.json({ eventId, isReminded: true });
});

// DELETE /api/me/reminders/:eventId
export const DELETE = handle(async (request: Request, ctx: Ctx) => {
  const user = await requireUser(request);
  const eventId = await eventIdFrom(ctx);
  await prisma.reminder.deleteMany({ where: { userId: user.id, eventId } });
  return Response.json({ eventId, isReminded: false });
});
