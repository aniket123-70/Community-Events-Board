"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { CATEGORIES } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { EventImage } from "../EventImage";

type Fields = {
  title: string;
  category: string;
  city: string;
  startsAt: string; // datetime-local value, entered in IST
  price: string;
  description: string;
  imageUrl: string;
};

const empty: Fields = { title: "", category: "", city: "", startsAt: "", price: "", description: "", imageUrl: "" };

export function EventForm() {
  const router = useRouter();
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    setErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await api("/api/admin/events", {
        method: "POST",
        json: {
          ...fields,
          price: fields.price === "" ? undefined : Number(fields.price),
          // the board is for Indian cities, so times are entered and stored as IST
          startsAt: fields.startsAt ? `${fields.startsAt}:00+05:30` : "",
        },
      });
      toast.success("Event published");
      router.push("/admin");
    } catch (err) {
      const apiErr = err as ApiError;
      const fieldErrors: Partial<Record<keyof Fields, string>> = {};
      for (const issue of apiErr.details ?? []) {
        const key = issue.path[0] as keyof Fields;
        if (key in empty && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length === 0) setFormError(apiErr.message);
      setSubmitting(false);
    }
  }

  const price = Number(fields.price);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> All events
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Add an event</h1>

      <form onSubmit={onSubmit} noValidate className="card space-y-5 p-5 sm:p-8">
        <Field label="Title" error={errors.title}>
          <input className="input" value={fields.title} onChange={set("title")} placeholder="Jazz Night by the Lake" />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category" error={errors.category}>
            <select className="input" value={fields.category} onChange={set("category")}>
              <option value="" disabled>
                Choose a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="City" error={errors.city}>
            <input className="input" value={fields.city} onChange={set("city")} placeholder="Coimbatore" />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Date and time (IST)" error={errors.startsAt}>
            <input className="input" type="datetime-local" value={fields.startsAt} onChange={set("startsAt")} />
          </Field>
          <Field
            label="Price in ₹"
            error={errors.price}
            hint={fields.price !== "" && Number.isFinite(price) && price >= 0 ? formatPrice(Math.round(price)) : "Use 0 for a free event"}
          >
            <input
              className="input"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={fields.price}
              onChange={set("price")}
              placeholder="499"
            />
          </Field>
        </div>

        <Field label="Description" error={errors.description}>
          <textarea
            className="input min-h-28 resize-y"
            value={fields.description}
            onChange={set("description")}
            placeholder="What should people expect?"
          />
        </Field>

        <Field label="Image URL" error={errors.imageUrl}>
          <input className="input" type="url" value={fields.imageUrl} onChange={set("imageUrl")} placeholder="https://…" />
        </Field>
        {/^https?:\/\/.+/.test(fields.imageUrl) && (
          <EventImage key={fields.imageUrl} src={fields.imageUrl} className="aspect-[16/9] w-full rounded-xl" />
        )}

        {formError && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/admin" className="btn-ghost">
            Cancel
          </Link>
          <button className="btn-primary" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Publish event
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error ? (
        <span className="block text-xs font-medium text-red-600">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
