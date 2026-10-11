"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Bell, BellRing } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "./AuthProvider";

/**
 * Optimistic toggle: the button flips immediately, the API call runs in the
 * background, and if it fails we flip back and explain why.
 */
export function RemindButton({
  eventId,
  initial = false,
  size = "sm",
}: {
  eventId: number;
  initial?: boolean;
  size?: "sm" | "lg";
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [reminded, setReminded] = useState(initial);
  const inFlight = useRef(false);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault(); // the button sits on top of a card link
    if (!user) {
      toast("Log in to get reminders", {
        action: { label: "Log in", onClick: () => router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`) },
      });
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;

    const next = !reminded;
    setReminded(next);
    try {
      await api(`/api/me/reminders/${eventId}`, { method: next ? "PUT" : "DELETE" });
    } catch (err) {
      setReminded(!next);
      toast.error(`Couldn't ${next ? "set" : "remove"} reminder. ${(err as Error).message}`);
    } finally {
      inFlight.current = false;
    }
  }

  const Icon = reminded ? BellRing : Bell;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={reminded}
      className={`relative z-10 inline-flex items-center gap-1.5 rounded-full border font-semibold transition active:scale-95 ${
        size === "lg" ? "px-5 py-2.5 text-sm" : "px-3 py-1.5 text-xs"
      } ${
        reminded
          ? "border-coral-500 bg-coral-500 text-white hover:bg-coral-600"
          : "border-line bg-white text-ink hover:border-coral-500 hover:text-coral-600"
      }`}
    >
      <Icon className={size === "lg" ? "size-4" : "size-3.5"} />
      {reminded ? "Reminder set" : "Remind me"}
    </button>
  );
}
