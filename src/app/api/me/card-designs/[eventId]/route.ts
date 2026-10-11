import { z } from "zod";
import { CARD_THEMES, MAX_STICKERS, STICKERS } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { handle, HttpError, readJson, requireUser } from "@/lib/http";

type Ctx = RouteContext<"/api/me/card-designs/[eventId]">;

const designSchema = z.object({
  theme: z.enum(CARD_THEMES, { error: "Unknown theme" }),
  stickers: z
    .array(z.enum(STICKERS, { error: "Unknown sticker" }))
    .max(MAX_STICKERS, `You can add up to ${MAX_STICKERS} stickers`)
    .refine((s) => new Set(s).size === s.length, "Each sticker can only be added once"),
});

async function findEvent(ctx: Ctx) {
  const id = Number((await ctx.params).eventId);
  const event = Number.isInteger(id)
    ? await prisma.event.findFirst({ where: { id, isActive: true }, select: { id: true } })
    : null;
  if (!event) throw new HttpError(404, "Event not found");
  return event.id;
}

// GET /api/me/card-designs/:eventId - { design: { theme, stickers } | null }
export const GET = handle(async (request: Request, ctx: Ctx) => {
  const user = await requireUser(request);
  const eventId = await findEvent(ctx);
  const row = await prisma.cardDesign.findUnique({ where: { userId_eventId: { userId: user.id, eventId } } });
  return Response.json({
    design: row ? { theme: row.theme, stickers: JSON.parse(row.stickers) as string[] } : null,
  });
});

// PUT /api/me/card-designs/:eventId { theme, stickers } - saves (or replaces) the user's design
export const PUT = handle(async (request: Request, ctx: Ctx) => {
  const user = await requireUser(request);
  const eventId = await findEvent(ctx);
  const { theme, stickers } = designSchema.parse(await readJson(request));

  await prisma.cardDesign.upsert({
    where: { userId_eventId: { userId: user.id, eventId } },
    update: { theme, stickers: JSON.stringify(stickers) },
    create: { userId: user.id, eventId, theme, stickers: JSON.stringify(stickers) },
  });
  return Response.json({ design: { theme, stickers } });
});
