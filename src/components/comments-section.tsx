"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatDate } from "@/lib/utils";
import { getDisplayUsername } from "@/lib/user-display";
import { ConfirmDialog } from "@/components/confirm-dialog";

type CommentItem = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  recalledAt: string | null;
  parentId: string | null;
  user: {
    name: string | null;
    email: string;
    username?: string | null;
  };
};

function displayName(user: CommentItem["user"]) {
  return getDisplayUsername(user);
}

function isRecalled(comment: CommentItem) {
  return Boolean(comment.recalledAt);
}

function buildThreads(comments: CommentItem[]) {
  const roots: CommentItem[] = [];
  const repliesByParent = new Map<string, CommentItem[]>();

  for (const comment of comments) {
    if (comment.parentId) {
      const list = repliesByParent.get(comment.parentId) ?? [];
      list.push(comment);
      repliesByParent.set(comment.parentId, list);
    } else {
      roots.push(comment);
    }
  }

  return { roots, repliesByParent };
}

function shouldShowThread(
  root: CommentItem,
  replies: CommentItem[],
) {
  if (!isRecalled(root)) return true;
  if (replies.length === 0) return false;
  return replies.some((reply) => !isRecalled(reply));
}

function CommentBody({
  comment,
  articleId,
  canComment,
  canRecall,
  onReplyPosted,
  onRecall,
  depth = 0,
}: {
  comment: CommentItem;
  articleId: string;
  canComment: boolean;
  canRecall: boolean;
  onReplyPosted: (comment: CommentItem) => void;
  onRecall: (comment: CommentItem) => void;
  depth?: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recalled = isRecalled(comment);

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch(`/api/articles/${articleId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: replyContent,
        parentId: comment.id,
      }),
    });

    setPending(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not post reply.");
      return;
    }

    const data = (await res.json()) as { comment: CommentItem };
    onReplyPosted(data.comment);
    setReplyContent("");
    setShowReplyForm(false);
  }

  const showActions =
    (!recalled && canComment && depth === 0) || (canRecall && !recalled);

  return (
    <article className={depth > 0 ? "mt-4 border-l-2 border-border pl-4" : undefined}>
      <div className="flex flex-wrap items-baseline gap-2 text-sm">
        {!recalled && (
          <span className="font-medium text-foreground">
            {displayName(comment.user)}
          </span>
        )}
        {!recalled && (
          <time className="text-muted-fg" dateTime={comment.createdAt}>
            {formatDate(comment.createdAt)}
          </time>
        )}
      </div>

      {recalled ? (
        <p className="mt-2 text-sm italic text-muted-fg">
          {depth > 0 ? "This reply was withdrawn." : "This comment was withdrawn."}
        </p>
      ) : (
        <p className="mt-2 whitespace-pre-wrap leading-relaxed text-muted">
          {comment.content}
        </p>
      )}

      {showActions && (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {canComment && depth === 0 && (
            <button
              type="button"
              onClick={() => setShowReplyForm((open) => !open)}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {showReplyForm ? "Cancel" : "Reply"}
            </button>
          )}
          {canRecall && (
            <button
              type="button"
              onClick={() => onRecall(comment)}
              className="text-sm text-muted transition-colors hover:text-red-600"
            >
              Recall
            </button>
          )}
        </div>
      )}

      {showReplyForm && (
        <form onSubmit={submitReply} className="mt-3 space-y-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            required
            rows={2}
            placeholder={`Reply to ${displayName(comment.user)}…`}
            className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={pending || !replyContent.trim()}
            className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Posting…" : "Post reply"}
          </button>
        </form>
      )}
    </article>
  );
}

export function CommentsSection({
  articleId,
  initialComments,
}: {
  articleId: string;
  initialComments: CommentItem[];
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recallTarget, setRecallTarget] = useState<CommentItem | null>(null);
  const [recalling, setRecalling] = useState(false);
  const [recallError, setRecallError] = useState<string | null>(null);

  const canComment = Boolean(
    session?.user && (session.user.username || session.user.isAdmin),
  );
  const needsUsername = Boolean(
    session?.user && !session.user.isAdmin && !session.user.username,
  );
  const { roots, repliesByParent } = useMemo(
    () => buildThreads(comments),
    [comments],
  );
  const visibleRoots = useMemo(
    () =>
      roots.filter((root) =>
        shouldShowThread(root, repliesByParent.get(root.id) ?? []),
      ),
    [roots, repliesByParent],
  );
  const visibleCount = useMemo(
    () => comments.filter((comment) => !isRecalled(comment)).length,
    [comments],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    setPending(true);
    setError(null);

    const res = await fetch(`/api/articles/${articleId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    setPending(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not post comment.");
      return;
    }

    const data = (await res.json()) as { comment: CommentItem };
    setComments((prev) => [...prev, data.comment]);
    setContent("");
  }

  function handleReplyPosted(reply: CommentItem) {
    setComments((prev) => [...prev, reply]);
  }

  function canRecallComment(comment: CommentItem) {
    return Boolean(
      session?.user?.id &&
        session.user.id === comment.userId &&
        !isRecalled(comment),
    );
  }

  async function confirmRecall() {
    if (!recallTarget) return;

    setRecalling(true);
    setRecallError(null);

    const res = await fetch(
      `/api/articles/${articleId}/comments/${recallTarget.id}`,
      { method: "DELETE" },
    );

    setRecalling(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setRecallError(data.error ?? "Could not recall comment.");
      return;
    }

    const data = (await res.json()) as {
      comment: CommentItem & { recalledAt: string | Date | null };
    };
    const recalledAt =
      data.comment.recalledAt instanceof Date
        ? data.comment.recalledAt.toISOString()
        : data.comment.recalledAt ?? new Date().toISOString();

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === data.comment.id ? { ...comment, recalledAt } : comment,
      ),
    );
    setRecallTarget(null);
  }

  return (
    <section className="mt-16 border-t border-border pt-12">
      <h2 className="font-serif text-2xl tracking-tight">
        Comments ({visibleCount})
      </h2>

      {canComment ? (
        <form onSubmit={submit} className="mt-6 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={3}
            placeholder="Share a thought…"
            className="w-full resize-none rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={pending || !content.trim()}
            className="rounded-md bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Posting…" : "Post comment"}
          </button>
        </form>
      ) : needsUsername ? (
        <p className="mt-4 text-sm text-muted">
          <Link href="/account/setup" className="text-accent hover:opacity-70">
            Choose a username
          </Link>{" "}
          before commenting.
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted">
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
            className="text-accent hover:opacity-70"
          >
            Sign in
          </Link>{" "}
          to comment.
        </p>
      )}

      <ul className="mt-8 space-y-8">
        {visibleRoots.map((comment) => (
          <li key={comment.id} className="border-b border-border pb-8 last:border-0">
            <CommentBody
              comment={comment}
              articleId={articleId}
              canComment={canComment}
              canRecall={canRecallComment(comment)}
              onReplyPosted={handleReplyPosted}
              onRecall={setRecallTarget}
            />
            {(repliesByParent.get(comment.id) ?? []).length > 0 && (
              <div className="mt-4 space-y-4">
                {(repliesByParent.get(comment.id) ?? []).map((reply) => (
                  <CommentBody
                    key={reply.id}
                    comment={reply}
                    articleId={articleId}
                    canComment={canComment}
                    canRecall={canRecallComment(reply)}
                    onReplyPosted={handleReplyPosted}
                    onRecall={setRecallTarget}
                    depth={1}
                  />
                ))}
              </div>
            )}
          </li>
        ))}
        {visibleRoots.length === 0 && (
          <li className="text-sm text-muted-fg">No comments yet.</li>
        )}
      </ul>

      <ConfirmDialog
        open={recallTarget !== null}
        title="Recall comment?"
        message={
          recallTarget?.parentId
            ? "This reply will show as withdrawn."
            : "This comment will show as withdrawn. Replies will stay visible."
        }
        confirmLabel="Recall"
        pendingLabel="Recalling…"
        pending={recalling}
        onConfirm={confirmRecall}
        onCancel={() => {
          if (recalling) return;
          setRecallTarget(null);
          setRecallError(null);
        }}
      />

      {recallError && recallTarget && (
        <p className="mt-3 text-sm text-red-600">{recallError}</p>
      )}
    </section>
  );
}
