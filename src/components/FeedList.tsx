"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Settings2, Sparkles } from "lucide-react";
import type { Category } from "@/lib/constants";
import type { EventItem, Pagination } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { EventCard } from "./EventCard";
import { CardGridSkeleton, EmptyState, ErrorState } from "./States";

type FeedResponse = { categories: Category[]; events: EventItem[]; pagination: Pagination };

export function FeedList() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi<FeedResponse>(`/api/me/feed?page=${page}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Feed</h1>
          {data && data.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {data.categories.map((c) => (
                <span key={c} className="rounded-full bg-coral-50 px-3 py-1 text-xs font-semibold text-coral-700">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
        <Link href="/preferences" className="btn-ghost">
          <Settings2 className="size-4" /> Edit interests
        </Link>
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : loading && !data ? (
        <CardGridSkeleton />
      ) : data && data.categories.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="size-7" />}
          title="Your feed is waiting"
          message="Pick a few categories you love and we'll show you upcoming events from them."
          action={<Link href="/preferences" className="btn-primary">Choose interests</Link>}
        />
      ) : data && data.events.length === 0 ? (
        <EmptyState
          title="Nothing coming up yet"
          message={`No upcoming ${data.categories.join(", ")} events right now. Try adding more interests or check back soon.`}
          action={<Link href="/" className="btn-primary">Browse all events</Link>}
        />
      ) : data ? (
        <>
          <div className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-50" : ""}`}>
            {data.events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
          {data.pagination.totalPages > 1 && (
            <nav className="flex items-center justify-center gap-3" aria-label="Pagination">
              <button className="btn-ghost px-3" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page">
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-sm text-muted">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <button
                className="btn-ghost px-3"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage(page + 1)}
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
