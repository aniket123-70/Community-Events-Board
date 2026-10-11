"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarHeart, Compass, LogOut, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "./AuthProvider";

export function Header() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Events", icon: Compass, show: true },
    { href: "/feed", label: "My Feed", icon: Sparkles, show: user?.role !== "ADMIN" },
    { href: "/admin", label: "Admin", icon: ShieldCheck, show: user?.role === "ADMIN" },
  ].filter((l) => l.show);

  const isActive = (href: string) => (href === "/" ? pathname === "/" || pathname.startsWith("/events") : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex items-center gap-1 sm:gap-6">
          <Link href="/" className="mr-1 flex items-center gap-2 font-bold tracking-tight" aria-label="Community Events home">
            <span className="grid size-9 place-items-center rounded-xl bg-coral-500 text-white">
              <CalendarHeart className="size-5" />
            </span>
            <span className="hidden lg:inline">Community Events</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-full px-3 py-2 transition ${
                  isActive(href) ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {loading ? (
            <span className="h-9 w-24 animate-pulse rounded-full bg-line" />
          ) : user ? (
            <>
              <span className="hidden max-w-48 truncate text-muted md:inline">{user.email}</span>
              <button
                className="btn-ghost px-3"
                onClick={async () => {
                  await logout();
                  // full reload so no per-user state (reminders, designs) lingers on screen
                  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                  window.location.assign("/");
                }}
                aria-label="Log out"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost px-4">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary px-4">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/** Static placeholder shown while the header (which reads the current URL) streams in. */
export function HeaderFallback() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
        <span className="grid size-9 place-items-center rounded-xl bg-coral-500 text-white">
          <CalendarHeart className="size-5" />
        </span>
      </div>
    </header>
  );
}
