"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getDisplayUsername } from "@/lib/user-display";

type LikeUser = {
  id: string;
  username?: string | null;
  name?: string | null;
  email: string;
};

function formatLikers(users: LikeUser[]) {
  const names = users.map((user) => getDisplayUsername(user));
  if (names.length === 0) return null;
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names[0]}, ${names[1]} and ${names.length - 2} others`;
}

export function LikeButton({
  articleId,
  initialCount,
  initialLiked,
  initialUsers,
}: {
  articleId: string;
  initialCount: number;
  initialLiked: boolean;
  initialUsers: LikeUser[];
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [users, setUsers] = useState(initialUsers);
  const [pending, setPending] = useState(false);
  const [showLikers, setShowLikers] = useState(false);

  const summary = useMemo(() => formatLikers(users), [users]);

  async function toggle() {
    if (status === "loading") return;
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    setPending(true);
    const previous = { count, liked, users };
    setLiked(!liked);
    setCount((c) => c + (liked ? -1 : 1));

    try {
      const res = await fetch(`/api/articles/${articleId}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as {
        count: number;
        liked: boolean;
        users: LikeUser[];
      };
      setCount(data.count);
      setLiked(data.liked);
      setUsers(data.users);
    } catch {
      setCount(previous.count);
      setLiked(previous.liked);
      setUsers(previous.users);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          aria-pressed={liked}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors duration-200 disabled:opacity-60",
            liked
              ? "border-accent bg-accent-soft text-accent"
              : "border-border text-muted hover:border-accent hover:text-foreground",
          )}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z" />
          </svg>
          <span>{liked ? "Liked" : "Like"}</span>
          <span className="tabular-nums text-muted-fg">{count}</span>
        </button>
        {!session?.user && (
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Sign in to like
          </Link>
        )}
      </div>

      {summary && (
        <div>
          <button
            type="button"
            onClick={() => setShowLikers((open) => !open)}
            className="text-left text-sm text-muted transition-colors hover:text-foreground"
          >
            Liked by <span className="text-foreground">{summary}</span>
          </button>

          {showLikers && (
            <ul className="mt-3 max-w-md rounded-lg border border-border bg-card px-4 py-3">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="py-1.5 text-sm text-foreground first:pt-0 last:pb-0"
                >
                  {getDisplayUsername(user)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
