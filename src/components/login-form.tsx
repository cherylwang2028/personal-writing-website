"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

type Mode = "signin" | "signup";

export function LoginForm({
  error,
  mode = "signin",
  onOwnerSignIn,
}: {
  error?: string;
  mode?: Mode;
  onOwnerSignIn?: () => void;
}) {
  const searchParams = useSearchParams();
  const isSignup = mode === "signup";
  const callbackUrl = searchParams.get("callbackUrl") || "/writing";
  const afterAuthUrl = isSignup
    ? "/account/setup?next=/writing"
    : `/account/setup?next=${encodeURIComponent(callbackUrl)}`;
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setLocalError(null);

    if (isSignup) {
      const profileRes = await fetch("/api/auth/pending-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
        }),
      });

      if (!profileRes.ok) {
        const data = (await profileRes.json().catch(() => ({}))) as {
          error?: string;
        };
        setPending(false);
        setLocalError(data.error ?? "Could not save username.");
        return;
      }
    }

    const result = await signIn("resend", {
      email: email.trim(),
      redirect: false,
      callbackUrl: afterAuthUrl,
    });

    setPending(false);

    if (result?.error) {
      setLocalError(
        "Could not send a link. Check the email and try again.",
      );
      return;
    }

    setSent(true);
  }

  const errorMessage =
    localError ?? (error ? "Something went wrong. Please try again." : null);

  if (sent) {
    return (
      <div className="rounded-lg border border-border bg-card px-5 py-6">
        <h2 className="font-serif text-2xl tracking-tight">Check your email</h2>
        <p className="mt-3 text-muted">
          We sent a link to finish {isSignup ? "creating your account" : "signing in"}.
          On local development without Resend, the link is printed in the
          terminal running the site.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {errorMessage && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {errorMessage}
        </p>
      )}

      <label className="block">
        <span className="text-sm text-muted">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2.5 outline-none focus:border-accent"
        />
      </label>

      {isSignup && (
        <label className="block">
          <span className="text-sm text-muted">Username</span>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your_name"
            autoComplete="username"
            spellCheck={false}
            className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2.5 outline-none focus:border-accent"
          />
          <p className="mt-2 text-xs text-muted-fg">
            Shown when you comment and like. You can change it later.
          </p>
        </label>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending
          ? "Sending link…"
          : isSignup
            ? "Create account"
            : "Sign in with email"}
      </button>

      <div className="space-y-2 text-sm text-muted">
        {isSignup ? (
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:opacity-70">
              Sign in
            </Link>
          </p>
        ) : (
          <>
            <p>
              First time here?{" "}
              <Link href="/signup" className="text-accent hover:opacity-70">
                Create an account
              </Link>
            </p>
            <p>
              {onOwnerSignIn ? (
                <button
                  type="button"
                  onClick={onOwnerSignIn}
                  className="text-accent hover:opacity-70"
                >
                  Sign in as owner
                </button>
              ) : (
                <Link href="/login?owner=1" className="text-accent hover:opacity-70">
                  Sign in as owner
                </Link>
              )}
            </p>
          </>
        )}
      </div>
    </form>
  );
}
