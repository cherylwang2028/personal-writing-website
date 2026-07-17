"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ContactForm({ defaultName }: { defaultName?: string | null }) {
  const router = useRouter();
  const [name, setName] = useState(defaultName ?? "");
  const [contactEmail, setContactEmail] = useState("");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contactEmail, reason }),
    });

    setPending(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not send your request.");
      return;
    }

    setSent(true);
    router.refresh();
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-border bg-card px-5 py-6">
        <h2 className="font-serif text-2xl tracking-tight">Request sent</h2>
        <p className="mt-3 text-muted">
          Cheryl will review your message and reply to the email you provided.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground">
        Enter Details
      </h2>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <label className="block">
        <span className="text-sm font-medium text-foreground">
          Name <span className="text-accent">*</span>
        </span>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground">
          Contact Me <span className="text-accent">*</span>
        </span>
        <input
          type="email"
          required
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="Where Cheryl can reach you"
          className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground">
          Reason <span className="text-accent">*</span>
        </span>
        <textarea
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="What would you like to discuss?"
          className="mt-2 w-full resize-none rounded-lg border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
