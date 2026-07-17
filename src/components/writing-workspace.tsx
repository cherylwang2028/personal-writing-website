"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Block } from "@blocknote/core";
import { NotionEditor } from "@/components/dynamic-notion-editor";
import { PageMotion, PageMotionSection } from "@/components/page-motion";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { parseBlocks } from "@/lib/blocks";
import type { CollectionMeta } from "@/lib/types";

type EditorApi = {
  getDocument: () => Block[];
  blocksToHTML: () => Promise<string>;
  blocksToPlainText: () => Promise<string>;
};

type ArticlePayload = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  tags: string;
  collection: string | null;
  status: string;
  slug: string;
};

async function readResponseJson(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function WritingWorkspace({
  article,
  collections,
}: {
  article?: ArticlePayload | null;
  collections: CollectionMeta[];
}) {
  const router = useRouter();
  const editorApi = useRef<EditorApi | null>(null);

  const [title, setTitle] = useState(article?.title ?? "");
  const [subtitle, setSubtitle] = useState(article?.subtitle ?? "");
  const [summary, setSummary] = useState(article?.summary ?? "");
  const [tagsInput, setTagsInput] = useState(() => {
    try {
      const tags = JSON.parse(article?.tags ?? "[]") as string[];
      return tags.join(", ");
    } catch {
      return "";
    }
  });
  const [collection, setCollection] = useState(article?.collection ?? "");
  const [status, setStatus] = useState(article?.status ?? "draft");
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [articleId, setArticleId] = useState(article?.id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initialContent = article?.content
    ? parseBlocks(article.content)
    : undefined;

  const onReady = useCallback((api: EditorApi) => {
    editorApi.current = api;
  }, []);

  async function save(nextStatus: "draft" | "published") {
    if (!editorApi.current) {
      setError("Editor is still loading. Try again in a moment.");
      return;
    }

    setSaving(nextStatus);
    setError(null);
    setMessage(null);

    try {
      const content = editorApi.current.getDocument();
      const html = await editorApi.current.blocksToHTML();
      const plainText = await editorApi.current.blocksToPlainText();
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        id: articleId,
        title,
        subtitle,
        summary:
          summary.trim() ||
          plainText.replace(/\s+/g, " ").trim().slice(0, 220),
        content,
        html,
        plainText,
        tags,
        collection: collection || null,
        status: nextStatus,
      };

      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await readResponseJson(res);
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Could not save",
        );
      }

      const saved = data.article as { id: string; status: string } | undefined;
      if (!saved?.id) {
        throw new Error("Save failed — no article returned from the server.");
      }

      setArticleId(saved.id);
      setStatus(saved.status);
      setMessage(
        nextStatus === "published" ? "Published." : "Draft saved.",
      );

      if (!articleId) {
        router.replace(`/write/${saved.id}`);
      }

      if (nextStatus === "published") {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(null);
    }
  }

  async function remove() {
    if (!articleId) return;

    setDeleting(true);
    setError(null);

    const res = await fetch(`/api/articles/${articleId}`, { method: "DELETE" });
    setDeleting(false);
    setShowDeleteConfirm(false);

    if (!res.ok) {
      setError("Could not delete");
      return;
    }
    router.push("/studio");
    router.refresh();
  }

  return (
    <>
      <PageMotion className="mx-auto max-w-3xl px-5 pb-28 pt-10 sm:px-8 sm:pt-14">
        <PageMotionSection>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm text-muted">
              <Link href="/studio" className="transition-colors hover:text-foreground">
                ← Writing studio
              </Link>
              <span className="text-muted-fg">·</span>
              <span className="capitalize">{status}</span>
              {article?.slug && status === "published" && (
                <>
                  <span className="text-muted-fg">·</span>
                  <Link
                    href={`/writing/${article.slug}`}
                    className="transition-colors hover:text-accent"
                  >
                    View live
                  </Link>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {articleId && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                disabled={!!saving}
                onClick={() => save("draft")}
                className="rounded-md border border-border bg-card px-3.5 py-1.5 text-sm transition-colors hover:bg-card-hover disabled:opacity-50"
              >
                {saving === "draft" ? "Saving…" : "Save draft"}
              </button>
              <button
                type="button"
                disabled={!!saving}
                onClick={() => save("published")}
                className="rounded-md bg-foreground px-3.5 py-1.5 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving === "published" ? "Publishing…" : "Publish"}
              </button>
            </div>
          </div>
        </PageMotionSection>

        {(message || error) && (
          <PageMotionSection>
            <p
              className={`mb-6 text-sm ${error ? "text-red-600 dark:text-red-400" : "text-accent"}`}
            >
              {error ?? message}
            </p>
          </PageMotionSection>
        )}

        <PageMotionSection>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="w-full bg-transparent font-serif text-4xl font-medium tracking-tight text-foreground outline-none placeholder:text-muted-fg sm:text-5xl"
          />

          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Add a subtitle…"
            className="mt-3 w-full bg-transparent font-serif text-xl italic text-muted outline-none placeholder:text-muted-fg sm:text-2xl"
          />
        </PageMotionSection>

        <PageMotionSection>
          <div className="mt-8 grid gap-4 border-y border-border py-5 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-muted-fg">Summary</span>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                placeholder="One sentence for cards and search (optional)"
                className="mt-1.5 w-full resize-none rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>
            <div className="space-y-4">
              <label className="block text-sm">
                <span className="text-muted-fg">Tags</span>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="economics, philosophy"
                  className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>
              <label className="block text-sm">
                <span className="text-muted-fg">Collection</span>
                <select
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
                >
                  <option value="">None</option>
                  {collections.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </PageMotionSection>

        <PageMotionSection>
          <div className="mt-8">
            <p className="mb-3 text-sm text-muted-fg">
              Click in the empty space below and type. Press{" "}
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[0.75rem]">
                /
              </kbd>{" "}
              for headings, lists, and more.
            </p>
            <NotionEditor initialContent={initialContent} onReady={onReady} />
          </div>
        </PageMotionSection>
      </PageMotion>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete this piece?"
        message="This will permanently remove the draft or published article. This cannot be undone."
        confirmLabel="Delete"
        pending={deleting}
        onConfirm={remove}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
