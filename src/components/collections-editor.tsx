"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { CollectionMeta } from "@/lib/types";

export function CollectionsEditor({
  initial,
}: {
  initial: CollectionMeta[];
}) {
  const router = useRouter();
  const [collections, setCollections] = useState(
    initial.map((c, index) => ({
      ...c,
      order: c.order ?? index + 1,
    })),
  );
  const [removedSlugs, setRemovedSlugs] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  function update(index: number, field: keyof CollectionMeta, value: string | number) {
    setCollections((items) =>
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function addCollection() {
    setCollections((items) => [
      ...items,
      {
        slug: "",
        title: "",
        description: "",
        order: items.length + 1,
      },
    ]);
  }

  function requestRemove(index: number) {
    setDeleteIndex(index);
  }

  async function confirmRemove() {
    if (deleteIndex === null) return;
    const item = collections[deleteIndex];
    if (item.slug) {
      setRemovedSlugs((slugs) =>
        slugs.includes(item.slug) ? slugs : [...slugs, item.slug],
      );
    }
    setCollections((items) => items.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/collections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collections, removedSlugs }),
    });

    setPending(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not save collections.");
      return;
    }

    setRemovedSlugs([]);
    setMessage("Collections saved.");
    router.refresh();
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-8">
        {(message || error) && (
          <p
            className={`text-sm ${error ? "text-red-600 dark:text-red-400" : "text-accent"}`}
          >
            {error ?? message}
          </p>
        )}

        <ul className="space-y-4">
          {collections.map((collection, index) => (
            <li
              key={`${collection.slug}-${index}`}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-serif text-lg tracking-tight">
                  {collection.title || "New collection"}
                </h3>
                <button
                  type="button"
                  onClick={() => requestRemove(index)}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-muted-fg">Title</span>
                  <input
                    value={collection.title}
                    onChange={(e) => update(index, "title", e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-muted-fg">Slug</span>
                  <input
                    value={collection.slug}
                    onChange={(e) => update(index, "slug", e.target.value)}
                    required
                    placeholder="economics"
                    className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="text-muted-fg">Description</span>
                  <textarea
                    value={collection.description}
                    onChange={(e) => update(index, "description", e.target.value)}
                    rows={2}
                    className="mt-1.5 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-muted-fg">Order</span>
                  <input
                    type="number"
                    min={1}
                    value={collection.order ?? index + 1}
                    onChange={(e) =>
                      update(index, "order", Number(e.target.value) || index + 1)
                    }
                    className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={addCollection}
          className="text-sm text-accent hover:opacity-70"
        >
          + Add collection
        </button>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-8">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save collections"}
          </button>
          <Link
            href="/"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            ← Back home
          </Link>
        </div>
      </form>

      <ConfirmDialog
        open={deleteIndex !== null}
        title="Remove this collection?"
        message="Articles in this collection will stay published, but they will no longer be grouped under it."
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        onCancel={() => setDeleteIndex(null)}
      />
    </>
  );
}
