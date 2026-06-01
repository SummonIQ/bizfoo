"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAnalytics } from "@summoniq/signalsplash-client-sdk/react";
import { authClient } from "@/lib/auth/client";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trackAndFlush } from "@/lib/analytics/client";

export default function SignUpPage() {
  const router = useRouter();
  const { identify, track } = useAnalytics();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const data = new FormData(e.currentTarget);
    const firstName = data.get("firstName") as string;
    const lastName = data.get("lastName") as string;
    const res = await authClient.signUp.email({
      email: data.get("email") as string,
      password: data.get("password") as string,
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
    });
    setBusy(false);
    if (res.error) {
      setErr(res.error.message ?? "Sign-up failed");
      track("sign_up_failed", {
        auth_method: "email",
        reason: "auth_error",
      });
      return;
    }
    if (res.data?.user?.id) {
      identify(res.data.user.id, {
        email: res.data.user.email ?? undefined,
        name: res.data.user.name ?? undefined,
        firstName,
        lastName,
      });
    }
    await trackAndFlush(track, "sign_up_succeeded", {
      auth_method: "email",
    });
    router.push("/dashboard");
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Spin up your first storefront in minutes."
      footer={
        <>
          Already have one?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-brand-300 hover:text-brand-200"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <Input name="firstName" required autoComplete="given-name" />
          </Field>
          <Field label="Last name">
            <Input name="lastName" required autoComplete="family-name" />
          </Field>
        </div>
        <Field label="Email">
          <Input name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <Input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </Field>
        {err ? (
          <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
            {err}
          </div>
        ) : null}
        <Button type="submit" disabled={busy} className="mt-1">
          {busy ? "Creating..." : "Create account"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By signing up you agree to our{" "}
          <Link href="/legal/terms" className="underline hover:text-foreground">
            terms
          </Link>{" "}
          and{" "}
          <Link
            href="/legal/privacy"
            className="underline hover:text-foreground"
          >
            privacy policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
