import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { publicEventSelect, withReminded } from "@/lib/events";
import { handle, HttpError } from "@/lib/http";

export const GET = handle(async (request: Request, ctx: RouteContext<"/api/events/[id]">) => {
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) throw new HttpError(404, "Event not found");

  // Inactive events are hidden from visitors; past events stay viewable by direct link
  const event = await prisma.event.findFirst({
    where: { id, isActive: true },
    select: publicEventSelect,
  });
  if (!event) throw new HttpError(404, "Event not found");

  const user = await getAuthUser(request);
  const [withFlag] = await withReminded([event], user?.id);
  return Response.json({ event: withFlag });
});
