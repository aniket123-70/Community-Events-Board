import { Suspense } from "react";
import { EventsBrowser } from "@/components/EventsBrowser";
import { CardGridSkeleton } from "@/components/States";

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">What&apos;s on near you</h1>
        <p className="mt-2 text-muted">Music nights, workshops, food fairs and more, nearest date first.</p>
      </section>
      <Suspense fallback={<CardGridSkeleton />}>
        <EventsBrowser />
      </Suspense>
    </div>
  );
}
