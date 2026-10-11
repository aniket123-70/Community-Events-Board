import { z } from "zod";
import { CATEGORIES } from "../constants";

export const createEventSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  category: z.enum(CATEGORIES, { error: "Pick a category" }),
  city: z.string().trim().min(2, "Enter a city").max(60),
  // ISO 8601 with offset, e.g. 2026-10-18T18:30:00+05:30
  startsAt: z.iso
    .datetime({ offset: true, error: "Enter a valid date and time" })
    .transform((v) => new Date(v))
    .refine((d) => d.getTime() > Date.now(), "Date must be in the future"),
  price: z.coerce
    .number({ error: "Enter a price" })
    .int("Price must be in whole rupees")
    .min(0, "Price can't be negative")
    .max(10_00_000, "Price looks too high"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  imageUrl: z.url({ protocol: /^https?$/, error: "Enter a valid image URL (http or https)" }),
});

export const updateEventStatusSchema = z.object({
  isActive: z.boolean({ error: "isActive must be true or false" }),
});
