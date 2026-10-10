import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { formatEventDate, formatPrice } from "@/lib/format";
import type { EventItem } from "@/lib/types";
import { EventImage } from "./EventImage";

export function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="card group relative flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-line">
        <EventImage src={event.imageUrl} className="size-full transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold backdrop-blur">
          {event.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-coral-600">
          <CalendarDays className="size-3.5" />
          {formatEventDate(event.startsAt)}
        </p>
        <h3 className="text-lg font-semibold leading-snug">
          <Link href={`/events/${event.id}`} className="after:absolute after:inset-0">
            {event.title}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2 text-sm">
          <span className="flex items-center gap-1 text-muted">
            <MapPin className="size-4" />
            {event.city}
          </span>
          <span className="font-semibold">{formatPrice(event.price)}</span>
        </div>
      </div>
    </article>
  );
}
