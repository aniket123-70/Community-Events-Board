"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import type { User } from "@/lib/types";
import { useAuth } from "./AuthProvider";

type Mode = "login" | "signup";

const copy = {
  login: { title: "Welcome back", cta: "Log in", alt: "New here?", altLink: "/signup", altCta: "Create an account" },
  signup: { title: "Create your account", cta: "Sign up", alt: "Already have an account?", altLink: "/login", altCta: "Log in" },
};

/** Only allow redirects to paths on this site */
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const t = copy[mode];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { user } = await api<{ token: string; user: User }>(`/api/auth/${mode}`, {
        method: "POST",
        json: { email, password },
      });
      setUser(user);
      router.push(user.role === "ADMIN" ? (next ?? "/admin") : (next ?? "/"));
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Email</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Password</span>
            <input
              className="input"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={mode === "signup" ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {mode === "signup" && <span className="text-xs text-muted">At least 8 characters</span>}
          </label>
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}
          <button className="btn-primary w-full" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {t.cta}
          </button>
        </form>
      </div>
      <p className="mt-4 text-center text-sm text-muted">
        {t.alt}{" "}
        <Link href={t.altLink} className="font-semibold text-coral-600 hover:underline">
          {t.altCta}
        </Link>
      </p>
    </div>
  );
}
