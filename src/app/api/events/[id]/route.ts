import { prisma } from "@/lib/db";
import { publicEventSelect } from "@/lib/events";
import { handle, HttpError } from "@/lib/http";

export const GET = handle(async (_request: Request, ctx: RouteContext<"/api/events/[id]">) => {
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) throw new HttpError(404, "Event not found");

  // Inactive events are hidden from visitors; past events stay viewable by direct link
  const event = await prisma.event.findFirst({
    where: { id, isActive: true },
    select: publicEventSelect,
  });
  if (!event) throw new HttpError(404, "Event not found");

  return Response.json({ event });
});
