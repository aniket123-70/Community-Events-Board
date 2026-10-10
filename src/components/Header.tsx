"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarHeart, LogOut } from "lucide-react";
import { useAuth } from "./AuthProvider";

export function Header() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-coral-500 text-white">
            <CalendarHeart className="size-5" />
          </span>
          <span className="hidden sm:inline">Community Events</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {loading ? (
            <span className="h-9 w-32 animate-pulse rounded-full bg-line" />
          ) : user ? (
            <>
              <span className="hidden max-w-48 truncate text-muted md:inline">{user.email}</span>
              <button
                className="btn-ghost px-3"
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                aria-label="Log out"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost px-4">Log in</Link>
              <Link href="/signup" className="btn-primary px-4">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
