import { prisma } from "@/lib/db";
import { handle, requireUser } from "@/lib/http";

// GET /api/me/reminders - ids of events the user asked to be reminded about
export const GET = handle(async (request: Request) => {
  const user = await requireUser(request);
  const rows = await prisma.reminder.findMany({ where: { userId: user.id }, select: { eventId: true } });
  return Response.json({ eventIds: rows.map((r) => r.eventId) });
});
