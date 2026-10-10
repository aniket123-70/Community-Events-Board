import "server-only";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { CATEGORIES, PAGE_SIZE } from "./constants";

export const eventFiltersSchema = z.object({
  category: z.enum(CATEGORIES).optional().catch(undefined),
  city: z.string().trim().max(60).optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).catch(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).catch(PAGE_SIZE).default(PAGE_SIZE),
});
export type EventFilters = z.infer<typeof eventFiltersSchema>;

/** Visitors only ever see active events that haven't started yet. */
export function visibleEventsWhere(now = new Date()): Prisma.EventWhereInput {
  return { isActive: true, startsAt: { gte: now } };
}

/** All filters are ANDed together; text search matches title OR description. */
export function buildEventsWhere({ category, city, q }: EventFilters): Prisma.EventWhereInput {
  return {
    ...visibleEventsWhere(),
    ...(category && { category }),
    ...(city && { city }),
    ...(q && { OR: [{ title: { contains: q } }, { description: { contains: q } }] }),
  };
}

export const publicEventSelect = {
  id: true,
  title: true,
  category: true,
  city: true,
  startsAt: true,
  price: true,
  description: true,
  imageUrl: true,
} satisfies Prisma.EventSelect;
