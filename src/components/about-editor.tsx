"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { AboutContent } from "@/lib/types";

function linesToList(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function AboutEditor({ initial }: { initial: AboutContent }) {
  const router = useRouter();
  const [bio, setBio] = useState(initial.bio);
  const [intro, setIntro] = useState(initial.intro);
  const [interests, setInterests] = useState(initial.interests.join("\n"));
  const [reading, setReading] = useState(initial.reading);
  const [inspirationIntro, setInspirationIntro] = useState(
    initial.inspirationIntro,
  );
  const [inspirationDisclaimer, setInspirationDisclaimer] = useState(
    initial.inspirationDisclaimer,
  );
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateReading(
    index: number,
    field: "title" | "author",
    value: string,
  ) {
    setReading((items) =>
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);

    const payload: AboutContent = {
      bio,
      intro,
      interests: linesToList(interests),
      reading: reading.filter((item) => item.title.trim() || item.author.trim()),
      inspirationIntro,
      inspirationDisclaimer,
    };

    const res = await fetch("/api/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setPending(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not save.");
      return;
    }

    setMessage("About page saved.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      {(message || error) && (
        <p
          className={`text-sm ${error ? "text-red-600 dark:text-red-400" : "text-accent"}`}
        >
          {error ?? message}
        </p>
      )}

      <section className="space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">Intro</h2>
        <label className="block text-sm">
          <span className="text-muted-fg">Bio</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="mt-1.5 w-full resize-y rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-fg">Second paragraph</span>
          <textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={3}
            className="mt-1.5 w-full resize-y rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">Current interests</h2>
        <label className="block text-sm">
          <span className="text-muted-fg">One per line</span>
          <textarea
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            rows={5}
            className="mt-1.5 w-full resize-y rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl tracking-tight">Currently reading</h2>
          <button
            type="button"
            onClick={() => setReading((items) => [...items, { title: "", author: "" }])}
            className="text-sm text-accent hover:opacity-70"
          >
            Add book
          </button>
        </div>
        <ul className="space-y-3">
          {reading.map((item, index) => (
            <li
              key={index}
              className="grid gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-2"
            >
              <input
                value={item.title}
                onChange={(e) => updateReading(index, "title", e.target.value)}
                placeholder="Title"
                className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <div className="flex gap-2">
                <input
                  value={item.author}
                  onChange={(e) => updateReading(index, "author", e.target.value)}
                  placeholder="Author"
                  className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() =>
                    setReading((items) => items.filter((_, i) => i !== index))
                  }
                  className="shrink-0 px-2 text-sm text-muted hover:text-foreground"
                  aria-label="Remove book"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">Inspiration</h2>
        <label className="block text-sm">
          <span className="text-muted-fg">Intro paragraph</span>
          <textarea
            value={inspirationIntro}
            onChange={(e) => setInspirationIntro(e.target.value)}
            rows={3}
            className="mt-1.5 w-full resize-y rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-fg">Disclaimer</span>
          <textarea
            value={inspirationDisclaimer}
            onChange={(e) => setInspirationDisclaimer(e.target.value)}
            rows={3}
            className="mt-1.5 w-full resize-y rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <p className="text-sm text-muted-fg">
          The inspiration list and footer links (Inspiration, RSS, GitHub, Contact
          Me) are managed in site settings.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-8">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save about page"}
        </button>
        <Link
          href="/about"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← View about page
        </Link>
      </div>
    </form>
  );
}
