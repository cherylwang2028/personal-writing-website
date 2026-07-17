"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const OWNER_EMAIL = "cherylwang2028@gmail.com";

export function OwnerLoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/studio";
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await signIn("credentials", {
      email: OWNER_EMAIL,
      password,
      redirect: false,
      callbackUrl,
    });

    setPending(false);

    if (result?.error) {
      setError("Incorrect email or password.");
      return;
    }

    window.location.href = result?.url ?? callbackUrl;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <label className="block">
        <span className="text-sm text-muted">Email</span>
        <input
          type="text"
          readOnly
          value="························"
          tabIndex={-1}
          aria-hidden
          className="mt-1.5 w-full cursor-default rounded-md border border-border bg-card px-3 py-2.5 tracking-widest text-muted outline-none select-none"
        />
      </label>

      <label className="block">
        <span className="text-sm text-muted">Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2.5 outline-none focus:border-accent"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in as owner"}
      </button>
    </form>
  );
}
