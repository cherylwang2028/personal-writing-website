"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function UsernameForm({
  initialUsername = "",
  required = false,
  redirectTo,
}: {
  initialUsername?: string;
  required?: boolean;
  redirectTo?: string;
}) {
  const { update } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/user/username", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      user?: { username: string | null };
    };

    setPending(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save username.");
      return;
    }

    await update({ username: data.user?.username ?? username });

    if (redirectTo) {
      router.push(redirectTo);
      router.refresh();
      return;
    }

    setMessage("Username saved.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm text-muted">Username</span>
        <input
          type="text"
          required={required}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="your_name"
          autoComplete="username"
          spellCheck={false}
          className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2.5 outline-none focus:border-accent"
        />
        <p className="mt-2 text-xs text-muted-fg">
          Letters, numbers, and underscores. Shown on comments and likes.
        </p>
      </label>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-md border border-border bg-card px-3 py-2 text-sm text-muted">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !username.trim()}
        className="rounded-md bg-foreground px-4 py-2.5 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : required ? "Continue" : "Save username"}
      </button>
    </form>
  );
}
