import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ShieldAlert } from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { EmptyState } from "@/components/States";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="card h-64 animate-pulse" aria-busy="true" />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

// Runs on the server for every admin page: the JWT cookie is verified before anything renders.
async function AdminGate({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/admin");

  if (user.role !== "ADMIN") {
    return (
      <EmptyState
        icon={<ShieldAlert className="size-7" />}
        title="Admins only"
        message="You're logged in, but this area is only for event organisers."
        action={<Link href="/" className="btn-primary">Back to events</Link>}
      />
    );
  }
  return <>{children}</>;
}
