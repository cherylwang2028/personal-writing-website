import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getDisplayUsername } from "@/lib/user-display";

type RecentComment = {
  id: string;
  content: string;
  createdAt: Date;
  user: { name: string | null; email: string; username?: string | null };
  article: { title: string; slug: string };
};

export function RecentComments({ comments }: { comments: RecentComment[] }) {
  if (comments.length === 0) {
    return (
      <p className="py-10 text-sm text-muted">
        No comments yet — sign in to leave the first one on a published piece.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border border-t border-border">
      {comments.map((comment) => (
        <li key={comment.id} className="py-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <span className="text-muted">
              {getDisplayUsername(comment.user)}
            </span>
            <time className="text-muted-fg" dateTime={comment.createdAt.toISOString()}>
              {formatDate(comment.createdAt)}
            </time>
          </div>
          <p className="mt-2 leading-relaxed text-foreground">{comment.content}</p>
          <Link
            href={`/writing/${comment.article.slug}`}
            className="mt-3 inline-block text-sm text-accent hover:opacity-70"
          >
            On {comment.article.title || "Untitled"} →
          </Link>
        </li>
      ))}
    </ul>
  );
}
