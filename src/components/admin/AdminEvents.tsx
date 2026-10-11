"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, MapPin, Plus } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatEventDate, formatPrice } from "@/lib/format";
import type { AdminEvent } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { EmptyState, ErrorState } from "../States";
import { EventImage } from "../EventImage";

export function AdminEvents() {
  const { data, error, loading, reload } = useApi<{ events: AdminEvent[] }>("/api/admin/events");
  // Local overrides so the switch flips instantly; rolled back if the request fails
  const [status, setStatus] = useState<Record<number, boolean>>({});
  const [pending, setPending] = useState<Set<number>>(new Set());

  async function toggle(event: AdminEvent, isActive: boolean) {
    const previous = status[event.id] ?? event.isActive;
    setStatus((s) => ({ ...s, [event.id]: isActive }));
    setPending((p) => new Set(p).add(event.id));
    try {
      await api(`/api/admin/events/${event.id}`, { method: "PATCH", json: { isActive } });
      toast.success(`${event.title} is now ${isActive ? "active" : "inactive"}`);
    } catch (e) {
      setStatus((s) => ({ ...s, [event.id]: previous }));
      toast.error((e as Error).message);
    } finally {
      setPending((p) => {
        const next = new Set(p);
        next.delete(event.id);
        return next;
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage events</h1>
          <p className="mt-1 text-muted">Inactive events are hidden from visitors. Nothing is ever deleted.</p>
        </div>
        <Link href="/admin/events/new" className="btn-primary">
          <Plus className="size-4" /> Add event
        </Link>
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : loading && !data ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="card h-24 animate-pulse" />
          ))}
        </div>
      ) : data?.events.length === 0 ? (
        <EmptyState
          title="No events yet"
          message="Add your first event and it will show up for visitors right away."
          action={<Link href="/admin/events/new" className="btn-primary">Add event</Link>}
        />
      ) : (
        <ul className="space-y-3">
          {data?.events.map((event) => {
            const isActive = status[event.id] ?? event.isActive;
            const isPast = new Date(event.startsAt) < new Date();
            return (
              <li key={event.id} className="card flex items-center gap-4 p-3 sm:p-4">
                <EventImage src={event.imageUrl} className="hidden size-16 shrink-0 rounded-xl sm:block" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-semibold">{event.title}</h2>
                    <span className="rounded-full bg-cream px-2 py-0.5 text-xs font-medium text-muted">{event.category}</span>
                    {isPast && (
                      <span className="rounded-full bg-line px-2 py-0.5 text-xs font-medium text-muted">Past</span>
                    )}
                  </div>
                  <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3.5" /> {formatEventDate(event.startsAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" /> {event.city}
                    </span>
                    <span className="font-medium text-ink">{formatPrice(event.price)}</span>
                  </p>
                </div>
                <label className="flex shrink-0 cursor-pointer flex-col items-center gap-1 sm:flex-row sm:gap-2">
                  <span className={`text-xs font-semibold ${isActive ? "text-emerald-700" : "text-muted"}`}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                  <input
                    type="checkbox"
                    role="switch"
                    className="peer sr-only"
                    checked={isActive}
                    disabled={pending.has(event.id)}
                    onChange={(e) => toggle(event, e.target.checked)}
                    aria-label={`${event.title} active`}
                  />
                  <span
                    aria-hidden
                    className="relative h-6 w-11 rounded-full bg-line transition peer-checked:bg-emerald-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-coral-500 peer-disabled:opacity-60 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
                  />
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
