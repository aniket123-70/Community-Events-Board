"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, CloudOff, Loader2, Palette, X } from "lucide-react";
import { api } from "@/lib/api-client";
import { CARD_THEMES, MAX_STICKERS, STICKERS, type CardTheme, type Sticker } from "@/lib/constants";
import { formatEventDate, formatPrice } from "@/lib/format";
import type { EventItem } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { useAuth } from "./AuthProvider";

type Design = { theme: CardTheme; stickers: Sticker[] };

const themes: Record<CardTheme, { label: string; background: string }> = {
  sunset: { label: "Sunset", background: "linear-gradient(135deg, #f2643f 0%, #f43f5e 55%, #fbbf24 100%)" },
  ocean: { label: "Ocean", background: "linear-gradient(135deg, #0ea5e9 0%, #0d9488 60%, #34d399 100%)" },
  midnight: { label: "Midnight", background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 55%, #a21caf 100%)" },
};

const stickerEmoji: Record<Sticker, string> = { star: "⭐", party: "🎉", music: "🎵", heart: "💖", fire: "🔥" };

// Where the 1st, 2nd and 3rd sticker sit on the card
const slots = [
  { top: "8%", right: "6%", rotate: 12 },
  { bottom: "26%", right: "10%", rotate: -10 },
  { top: "34%", right: "28%", rotate: 6 },
];

const DEFAULT_DESIGN: Design = { theme: "sunset", stickers: [] };

export function CardDesigner({ event }: { event: EventItem }) {
  const { user, loading } = useAuth();

  return (
    <section className="card space-y-5 p-5 sm:p-8" aria-labelledby="designer-heading">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-coral-50 text-coral-600">
          <Palette className="size-5" />
        </span>
        <div>
          <h2 id="designer-heading" className="text-xl font-bold tracking-tight">
            Design your card
          </h2>
          <p className="text-sm text-muted">Pick a theme and up to {MAX_STICKERS} stickers. We&apos;ll keep it for this event.</p>
        </div>
      </div>

      {loading ? (
        <div className="aspect-[16/10] animate-pulse rounded-3xl bg-line" />
      ) : user ? (
        <SavedDesigner event={event} />
      ) : (
        <div className="space-y-4">
          <CardPreview event={event} design={DEFAULT_DESIGN} />
          <p className="rounded-xl bg-cream px-4 py-3 text-center text-sm text-muted">
            <Link
              href={`/login?next=${encodeURIComponent(`/events/${event.id}`)}`}
              className="font-semibold text-coral-600 hover:underline"
            >
              Log in
            </Link>{" "}
            to design and save your own card.
          </p>
        </div>
      )}
    </section>
  );
}

/** Loads the user's saved design first, then hands it to the editor. */
function SavedDesigner({ event }: { event: EventItem }) {
  const { data, error, loading, reload } = useApi<{ design: Design | null }>(`/api/me/card-designs/${event.id}`);

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 px-4 py-6 text-center text-sm text-red-700">
        Couldn&apos;t load your card design. {error.message}{" "}
        <button className="font-semibold underline" onClick={reload}>
          Try again
        </button>
      </div>
    );
  }
  if (loading || !data) return <div className="aspect-[16/10] animate-pulse rounded-3xl bg-line" />;
  return <DesignEditor event={event} initial={data.design ?? DEFAULT_DESIGN} />;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

function DesignEditor({ event, initial }: { event: EventItem; initial: Design }) {
  const [design, setDesign] = useState<Design>(initial);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [attempt, setAttempt] = useState(0);
  const lastSaved = useRef(JSON.stringify(initial));

  // Auto-save shortly after the last change, so quick taps become one request
  useEffect(() => {
    const body = JSON.stringify(design);
    if (body === lastSaved.current) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setStatus("saving");
      try {
        await api(`/api/me/card-designs/${event.id}`, { method: "PUT", json: design });
        lastSaved.current = body;
        if (!cancelled) setStatus("saved");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [design, event.id, attempt]);

  const full = design.stickers.length >= MAX_STICKERS;

  function toggleSticker(sticker: Sticker) {
    setDesign((d) => {
      if (d.stickers.includes(sticker)) return { ...d, stickers: d.stickers.filter((s) => s !== sticker) };
      if (d.stickers.length >= MAX_STICKERS) return d;
      return { ...d, stickers: [...d.stickers, sticker] };
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <CardPreview event={event} design={design} onRemoveSticker={toggleSticker} />

      <div className="space-y-6">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Background</legend>
          <div className="grid grid-cols-3 gap-2">
            {CARD_THEMES.map((t) => {
              const selected = design.theme === t;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setDesign((d) => ({ ...d, theme: t }))}
                  className={`group rounded-2xl border-2 p-1.5 text-xs font-semibold transition active:scale-95 ${
                    selected ? "border-ink" : "border-transparent hover:border-line"
                  }`}
                >
                  <span className="relative block h-12 rounded-xl" style={{ background: themes[t].background }}>
                    {selected && (
                      <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-white text-ink">
                        <Check className="size-3" />
                      </span>
                    )}
                  </span>
                  <span className="mt-1.5 block">{themes[t].label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 flex w-full justify-between text-sm font-semibold">
            <span>Stickers</span>
            <span className={`font-medium ${full ? "text-coral-600" : "text-muted"}`}>
              {design.stickers.length}/{MAX_STICKERS}
            </span>
          </legend>
          <div className="grid grid-cols-5 gap-2">
            {STICKERS.map((s) => {
              const selected = design.stickers.includes(s);
              const disabled = !selected && full;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${selected ? "Remove" : "Add"} ${s} sticker`}
                  disabled={disabled}
                  onClick={() => toggleSticker(s)}
                  className={`grid aspect-square place-items-center rounded-2xl border-2 text-2xl transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-35 ${
                    selected ? "border-coral-500 bg-coral-50" : "border-line bg-white hover:border-ink/20"
                  }`}
                >
                  {stickerEmoji[s]}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted">
            {full ? "That's the maximum. Tap a sticker again (or on the card) to remove it." : "Tap to add, tap again to remove."}
          </p>
        </fieldset>

        <SaveIndicator status={status} onRetry={() => setAttempt((a) => a + 1)} />
      </div>
    </div>
  );
}

function SaveIndicator({ status, onRetry }: { status: SaveStatus; onRetry: () => void }) {
  if (status === "idle") return null;
  return (
    <p className="flex items-center gap-1.5 text-sm" role="status" aria-live="polite">
      {status === "saving" && (
        <>
          <Loader2 className="size-4 animate-spin text-muted" /> <span className="text-muted">Saving…</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="size-4 text-emerald-600" /> <span className="text-emerald-700">Saved</span>
        </>
      )}
      {status === "error" && (
        <>
          <CloudOff className="size-4 text-red-600" />
          <span className="text-red-700">Couldn&apos;t save your design.</span>
          <button className="font-semibold text-red-700 underline" onClick={onRetry}>
            Retry
          </button>
        </>
      )}
    </p>
  );
}

function CardPreview({
  event,
  design,
  onRemoveSticker,
}: {
  event: EventItem;
  design: Design;
  onRemoveSticker?: (s: Sticker) => void;
}) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-3xl text-white shadow-xl shadow-ink/10">
      {/* every theme is layered; switching just crossfades opacity */}
      {CARD_THEMES.map((t) => (
        <motion.div
          key={t}
          className="absolute inset-0"
          style={{ background: themes[t].background }}
          initial={false}
          animate={{ opacity: design.theme === t ? 1 : 0, scale: design.theme === t ? 1 : 1.08 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_120%,rgba(255,255,255,0.25),transparent_55%)]" />

      <div className="relative flex h-full flex-col justify-end gap-1 p-5 sm:p-7">
        <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">{event.category}</span>
        <h3 className="max-w-[75%] text-2xl font-bold leading-tight drop-shadow-sm sm:text-3xl">{event.title}</h3>
        <p className="text-sm font-medium text-white/90">
          {formatEventDate(event.startsAt)} · {event.city} · {formatPrice(event.price)}
        </p>
      </div>

      <AnimatePresence>
        {design.stickers.map((s, i) => {
          const { rotate, ...position } = slots[i];
          return (
            <motion.button
              key={s}
              type="button"
              layout
              disabled={!onRemoveSticker}
              onClick={() => onRemoveSticker?.(s)}
              aria-label={`Remove ${s} sticker from card`}
              className="group absolute text-4xl drop-shadow-lg disabled:cursor-default sm:text-6xl"
              style={position}
              initial={{ scale: 0, rotate: rotate - 40, opacity: 0 }}
              animate={{ scale: 1, rotate, opacity: 1 }}
              exit={{ scale: 0, rotate: rotate + 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 20 }}
              whileHover={onRemoveSticker ? { scale: 1.1 } : undefined}
            >
              {stickerEmoji[s]}
              {onRemoveSticker && (
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-ink text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  <X className="size-3" />
                </span>
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
