"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { api } from "@/lib/api-client";
import { CATEGORIES } from "@/lib/constants";
import type { EventItem, Pagination } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { EventCard } from "./EventCard";
import { CardGridSkeleton, EmptyState, ErrorState } from "./States";

type EventsResponse = { events: EventItem[]; pagination: Pagination };

export function EventsBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filters live in the URL so they survive refresh and can be shared
  const category = searchParams.get("category") ?? "";
  const city = searchParams.get("city") ?? "";
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? 1) || 1;

  const [search, setSearch] = useState(q);
  const [cities, setCities] = useState<string[]>([]);

  const updateParams = useCallback(
    (changes: Record<string, string>) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      if (!("page" in changes)) next.delete("page"); // new filters start from page 1
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Debounce the text search so we don't hit the API on every keystroke
  useEffect(() => {
    if (search.trim() === q) return;
    const t = setTimeout(() => updateParams({ q: search.trim() }), 350);
    return () => clearTimeout(t);
  }, [search, q, updateParams]);

  useEffect(() => {
    api<{ cities: string[] }>("/api/cities")
      .then((d) => setCities(d.cities))
      .catch(() => setCities([]));
  }, []);

  const apiParams = new URLSearchParams({ page: String(page) });
  if (category) apiParams.set("category", category);
  if (city) apiParams.set("city", city);
  if (q) apiParams.set("q", q);
  const { data, error, loading, reload } = useApi<EventsResponse>(`/api/events?${apiParams}`);

  const hasFilters = Boolean(category || city || q);

  return (
    <div className="space-y-6">
      <div className="card grid gap-3 p-3 sm:grid-cols-[1fr_auto_auto] sm:p-4">
        <label className="relative">
          <span className="sr-only">Search events</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            className="input pl-10"
            placeholder="Search events, e.g. night"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">City</span>
          <select className="input sm:w-44" value={city} onChange={(e) => updateParams({ city: e.target.value })}>
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        {hasFilters && (
          <button
            className="btn-ghost"
            onClick={() => {
              setSearch("");
              router.replace(pathname, { scroll: false });
            }}
          >
            <X className="size-4" /> Clear
          </button>
        )}
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 sm:col-span-3" role="group" aria-label="Category">
          {["", ...CATEGORIES].map((c) => {
            const active = category === c;
            return (
              <button
                key={c || "all"}
                aria-pressed={active}
                onClick={() => updateParams({ category: c })}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink/30"
                }`}
              >
                {c || "All"}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : loading && !data ? (
        <CardGridSkeleton />
      ) : data && data.events.length === 0 ? (
        <EmptyState
          title="No events found"
          message={
            hasFilters
              ? "Try a different category, city or search word."
              : "Check back soon, new events are added every week."
          }
        />
      ) : data ? (
        <>
          <p className="text-sm text-muted">
            {data.pagination.total} upcoming event{data.pagination.total === 1 ? "" : "s"}
          </p>
          <div className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-50" : ""}`}>
            {data.events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
          {data.pagination.totalPages > 1 && (
            <nav className="flex items-center justify-center gap-3" aria-label="Pagination">
              <button
                className="btn-ghost px-3"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-sm text-muted">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <button
                className="btn-ghost px-3"
                disabled={page >= data.pagination.totalPages}
                onClick={() => updateParams({ page: String(page + 1) })}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </button>
            </nav>
          )}
        </>
      ) : null}
    </div>
  );
}
