"use client";

import { useMemo, useState, useEffect, useDeferredValue } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import type { SearchDocument } from "@/lib/search";
import { formatDate, readingTimeLabel } from "@/lib/utils";

export function SearchExperience({ documents }: { documents: SearchDocument[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const fuse = useMemo(
    () =>
      new Fuse(documents, {
        keys: [
          { name: "title", weight: 0.35 },
          { name: "tags", weight: 0.2 },
          { name: "summary", weight: 0.15 },
          { name: "content", weight: 0.2 },
          { name: "collection", weight: 0.1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
        includeScore: true,
      }),
    [documents],
  );

  const results = useMemo(() => {
    const q = deferredQuery.trim();
    if (!q) return [];
    return fuse.search(q).slice(0, 24);
  }, [deferredQuery, fuse]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q");
    if (initial) setQuery(initial);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (query.trim()) {
      url.searchParams.set("q", query.trim());
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState({}, "", url.toString());
  }, [query]);

  return (
    <div>
      <label htmlFor="search" className="sr-only">
        Search writing
      </label>
      <input
        id="search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search titles, tags, collections, or full text…"
        autoFocus
        className="w-full border-b border-border bg-transparent py-4 font-serif text-2xl tracking-tight text-foreground outline-none placeholder:text-muted-fg focus:border-accent sm:text-3xl"
      />

      <div className="mt-3 text-sm text-muted">
        {!query.trim()
          ? `${documents.filter((d) => d.type === "article").length} articles indexed`
          : results.length === 0
            ? "No results"
            : `${results.length} result${results.length === 1 ? "" : "s"}`}
      </div>

      <ul className="mt-8 divide-y divide-border">
        {results.map(({ item }) => (
          <li key={item.id} className="py-6">
            <Link href={item.href} className="group block">
              <div className="flex flex-wrap items-center gap-2 text-[0.75rem] uppercase tracking-[0.08em] text-muted-fg">
                <span>{item.type === "article" ? "Article" : "Collection"}</span>
                {item.date && (
                  <>
                    <span>·</span>
                    <time dateTime={item.date}>{formatDate(item.date)}</time>
                  </>
                )}
                {item.readingTime != null && (
                  <>
                    <span>·</span>
                    <span className="normal-case tracking-normal">
                      {readingTimeLabel(item.readingTime)}
                    </span>
                  </>
                )}
              </div>
              <h2 className="mt-2 font-serif text-xl tracking-tight transition-colors duration-300 group-hover:text-accent sm:text-2xl">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                {item.summary}
              </p>
              {item.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-accent-soft/60 px-2 py-0.5 text-[0.75rem] text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
