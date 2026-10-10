import { Suspense } from "react";
import { DetailSkeleton, EventDetail } from "@/components/EventDetail";

export default function EventPage({ params }: PageProps<"/events/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <EventDetailFromParams params={params} />
    </Suspense>
  );
}

async function EventDetailFromParams({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventDetail id={id} />;
}
