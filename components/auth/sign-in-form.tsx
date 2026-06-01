"use client";

import { useState } from "react";
import { useAnalytics } from "@summoniq/signalsplash-client-sdk/react";
import { authClient } from "@/lib/auth/client";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trackAndFlush } from "@/lib/analytics/client";

type SessionResponse = {
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
  };
  session?: unknown;
};

export function SignInForm() {
  const { identify, track } = useAnalytics();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function waitForSession() {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const res = await fetch("/api/auth/get-session", {
        cache: "no-store",
        credentials: "include",
      });

      const session = res.ok ? await res.json().catch(() => null) : null;
      if (session?.session && session?.user) {
        return session as SessionResponse;
      }

      await new Promise((resolve) => {
        window.setTimeout(resolve, 100 * (attempt + 1));
      });
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setErr(null);

    const data = new FormData(e.currentTarget);
    const res = await authClient.signIn.email({
      email: data.get("email") as string,
      password: data.get("password") as string,
    });

    setBusy(false);
    if (res.error) {
      setErr(res.error.message ?? "Sign-in failed");
      track("sign_in_failed", {
        auth_method: "email",
        reason: "auth_error",
      });
      return;
    }

    const session = await waitForSession();
    setBusy(false);

    if (!session) {
      setErr("Sign-in succeeded, but the session did not persist. Reload and try again.");
      track("sign_in_failed", {
        auth_method: "email",
        reason: "session_not_persisted",
      });
      return;
    }

    if (session.user?.id) {
      identify(session.user.id, {
        email: session.user.email ?? undefined,
        name: session.user.name ?? undefined,
      });
    }
    await trackAndFlush(track, "sign_in_succeeded", {
      auth_method: "email",
    });
    window.location.replace("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Field label="Email">
        <Input name="email" type="email" required autoComplete="email" />
      </Field>
      <Field label="Password">
        <Input
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </Field>
      {err ? (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
          {err}
        </div>
      ) : null}
      <Button type="submit" disabled={busy} className="mt-1">
        {busy ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
