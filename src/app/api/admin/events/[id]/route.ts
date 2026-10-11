import { prisma } from "@/lib/db";
import { handle, HttpError, readJson, requireAdmin } from "@/lib/http";
import { updateEventStatusSchema } from "@/lib/validation/event";

// PATCH /api/admin/events/:id { isActive } - events are never deleted, only deactivated
export const PATCH = handle(async (request: Request, ctx: RouteContext<"/api/admin/events/[id]">) => {
  await requireAdmin(request);
  const id = Number((await ctx.params).id);
  const { isActive } = updateEventStatusSchema.parse(await readJson(request));

  const result = await prisma.event.updateMany({ where: { id: Number.isInteger(id) ? id : -1 }, data: { isActive } });
  if (result.count === 0) throw new HttpError(404, "Event not found");

  const event = await prisma.event.findUnique({ where: { id } });
  return Response.json({ event });
});
