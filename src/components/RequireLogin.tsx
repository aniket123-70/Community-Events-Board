"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { EmptyState } from "./States";

/** Shows a friendly log-in prompt instead of the page for guests. The APIs behind these pages also require a token. */
export function RequireLogin({ message, children }: { message: string; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) return <div className="card h-64 animate-pulse" aria-busy="true" />;
  if (!user) {
    return (
      <EmptyState
        icon={<LogIn className="size-7" />}
        title="Log in to continue"
        message={message}
        action={
          <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="btn-primary">
            Log in
          </Link>
        }
      />
    );
  }
  return <>{children}</>;
}
