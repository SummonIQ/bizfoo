import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { auth } from "@/lib/auth/server";

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back to your bizfoo workspace."
      footer={
        <>
          No account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-brand-300 hover:text-brand-200"
          >
            Create one
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthShell>
  );
}
