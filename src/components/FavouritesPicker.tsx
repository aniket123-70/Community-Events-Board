"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { CATEGORIES, type Category } from "@/lib/constants";
import { useAuth } from "./AuthProvider";

const emoji: Record<Category, string> = { Music: "🎵", Workshop: "🛠️", Food: "🍜", Sports: "⚽", Kids: "🧸" };

export function FavouritesPicker() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [selected, setSelected] = useState<Set<Category>>(new Set(user?.favourites ?? []));
  const [saving, setSaving] = useState(false);

  function toggle(c: Category) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    try {
      const { categories } = await api<{ categories: Category[] }>("/api/me/favourites", {
        method: "PUT",
        json: { categories: [...selected] },
      });
      if (user) setUser({ ...user, favourites: categories });
      toast.success("Interests saved");
      router.push("/feed");
    } catch (e) {
      toast.error((e as Error).message);
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">What are you into?</h1>
        <p className="mt-1 text-muted">Pick your favourite categories and we&apos;ll build your feed from them.</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3" role="group" aria-label="Favourite categories">
          {CATEGORIES.map((c) => {
            const on = selected.has(c);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(c)}
                className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 font-semibold transition active:scale-95 ${
                  on ? "border-coral-500 bg-coral-50 text-coral-700" : "border-line bg-white hover:border-ink/20"
                }`}
              >
                {on && (
                  <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-coral-500 text-white">
                    <Check className="size-3" />
                  </span>
                )}
                <span className="text-3xl" aria-hidden>
                  {emoji[c]}
                </span>
                {c}
              </button>
            );
          })}
        </div>

        <button className="btn-primary mt-8 w-full" onClick={save} disabled={saving || selected.size === 0}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {selected.size === 0 ? "Pick at least one" : `Save ${selected.size} interest${selected.size > 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
