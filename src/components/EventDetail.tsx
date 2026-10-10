"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, IndianRupee, MapPin } from "lucide-react";
import { formatEventDate, formatPrice } from "@/lib/format";
import type { EventItem } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { EventImage } from "./EventImage";
import { EmptyState, ErrorState } from "./States";

export function EventDetail({ id }: { id: string }) {
  const { data, error, loading, reload } = useApi<{ event: EventItem }>(`/api/events/${encodeURIComponent(id)}`);
  const event = data?.event;

  if (error?.status === 404) {
    return (
      <EmptyState
        title="Event not found"
        message="It may have been removed or is no longer available."
        action={<Link href="/" className="btn-primary">Browse events</Link>}
      />
    );
  }
  if (error) return <ErrorState message={error.message} onRetry={reload} />;
  if (loading || !event) return <DetailSkeleton />;

  return (
    <article className="space-y-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> All events
      </Link>
      <div className="card overflow-hidden">
        <EventImage src={event.imageUrl} className="aspect-[16/9] w-full sm:aspect-[21/9]" />
        <div className="space-y-5 p-5 sm:p-8">
          <span className="inline-block rounded-full bg-coral-50 px-3 py-1 text-xs font-semibold text-coral-700">
            {event.category}
          </span>
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{event.title}</h1>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <Fact icon={<CalendarDays className="size-4" />} label="When" value={formatEventDate(event.startsAt)} />
            <Fact icon={<MapPin className="size-4" />} label="Where" value={event.city} />
            <Fact icon={<IndianRupee className="size-4" />} label="Price" value={formatPrice(event.price)} />
          </dl>
          <p className="max-w-prose leading-relaxed text-ink/80">{event.description}</p>
        </div>
      </div>
    </article>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-cream px-4 py-3">
      <span className="text-coral-600">{icon}</span>
      <div>
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="font-semibold">{value}</dd>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="card overflow-hidden" aria-busy="true">
      <div className="aspect-[16/9] animate-pulse bg-line/70 sm:aspect-[21/9]" />
      <div className="space-y-4 p-5 sm:p-8">
        <div className="h-4 w-20 animate-pulse rounded bg-line" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-line" />
        <div className="h-16 animate-pulse rounded bg-line" />
      </div>
    </div>
  );
}
