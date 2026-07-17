import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { userIsAdmin } from "@/lib/auth.config";
import { getAuthorArticles, parseTags } from "@/lib/articles-db";
import { formatDate } from "@/lib/utils";
import { PageMotion, PageMotionSection } from "@/components/page-motion";

export const metadata: Metadata = {
  title: "Writing studio",
  robots: { index: false, follow: false },
};

export default async function WritingStudioPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/studio");
  if (!userIsAdmin(session.user)) redirect("/writing?notice=writer-only");

  const articles = await getAuthorArticles(session.user.id);
  const drafts = articles.filter((a) => a.status === "draft");
  const published = articles.filter((a) => a.status === "published");

  return (
    <PageMotion className="mx-auto max-w-3xl px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
      <PageMotionSection>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">
              Writing studio
            </h1>
            <p className="mt-3 text-muted">
              Drafts, published pieces, and the editor — in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/collections/edit"
              className="rounded-md border border-border px-3.5 py-2 text-sm text-muted transition-colors hover:bg-card hover:text-foreground"
            >
              Edit collections
            </Link>
            <Link
              href="/write"
              className="rounded-md bg-foreground px-3.5 py-2 text-sm text-background transition-opacity hover:opacity-90"
            >
              New piece
            </Link>
          </div>
        </div>
      </PageMotionSection>

      <PageMotionSection className="mt-14">
        <h2 className="font-serif text-2xl tracking-tight">Drafts</h2>
        {drafts.length === 0 ? (
          <p className="mt-4 text-muted">
            No drafts yet.{" "}
            <Link href="/write" className="text-accent hover:opacity-70">
              Start writing
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border border-t border-border">
            {drafts.map((article) => (
              <li key={article.id} className="py-5">
                <Link href={`/write/${article.id}`} className="group block">
                  <h3 className="font-serif text-xl tracking-tight transition-colors group-hover:text-accent">
                    {article.title || "Untitled"}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    Updated {formatDate(article.updatedAt)}
                    {parseTags(article.tags).length > 0 &&
                      ` · ${parseTags(article.tags).join(", ")}`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageMotionSection>

      <PageMotionSection className="mt-16">
        <h2 className="font-serif text-2xl tracking-tight">Published</h2>
        {published.length === 0 ? (
          <p className="mt-4 text-muted">Nothing published yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border border-t border-border">
            {published.map((article) => (
              <li
                key={article.id}
                className="flex flex-wrap items-baseline justify-between gap-3 py-5"
              >
                <div>
                  <Link
                    href={`/write/${article.id}`}
                    className="font-serif text-xl tracking-tight transition-colors hover:text-accent"
                  >
                    {article.title || "Untitled"}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {article.publishedAt
                      ? formatDate(article.publishedAt)
                      : formatDate(article.updatedAt)}
                  </p>
                </div>
                <Link
                  href={`/writing/${article.slug}`}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  View live
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageMotionSection>
    </PageMotion>
  );
}
