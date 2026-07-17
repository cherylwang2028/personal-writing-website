import Link from "next/link";
import type { Article } from "@/lib/types";
import { formatDate, readingTimeLabel, cn } from "@/lib/utils";

type ArticleCardProps = {
  article: Article;
  variant?: "default" | "compact";
};

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  return (
    <article
      className={cn(
        "group border-b border-border transition-colors duration-300 last:border-b-0",
        variant === "default" ? "py-8" : "py-5",
      )}
    >
      <Link href={`/writing/${article.slug}`} className="block outline-none">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8rem] text-muted">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          <span aria-hidden className="text-muted-fg">
            ·
          </span>
          <span>{readingTimeLabel(article.readingTime)}</span>
        </div>

        <h2
          className={cn(
            "mt-2 font-serif font-medium tracking-tight text-foreground transition-colors duration-300 group-hover:text-accent",
            variant === "default" ? "text-2xl sm:text-[1.65rem]" : "text-xl",
          )}
        >
          {article.title}
        </h2>

        {article.subtitle && variant === "default" && (
          <p className="mt-1.5 font-serif text-base text-muted italic sm:text-lg">
            {article.subtitle}
          </p>
        )}

        <p
          className={cn(
            "mt-3 leading-relaxed text-muted",
            variant === "default" ? "text-[0.95rem] sm:text-base" : "text-sm",
          )}
        >
          {article.summary}
        </p>
      </Link>

      {article.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <li key={tag}>
              <Link
                href={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                className="rounded-md bg-accent-soft/60 px-2 py-0.5 text-[0.75rem] text-muted transition-colors duration-200 hover:bg-accent-soft hover:text-foreground"
              >
                {tag}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
