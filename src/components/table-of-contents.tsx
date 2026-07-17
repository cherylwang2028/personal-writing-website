"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0% -65% 0%", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden xl:block">
      <nav
        aria-label="Table of contents"
        className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2"
      >
        <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-muted-fg">
          Contents
        </p>
        <ul className="space-y-2 border-l border-border">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={cn(
                  "block border-l-2 -ml-px py-0.5 text-[0.8rem] leading-snug transition-colors duration-200",
                  heading.level === 3 ? "pl-5" : "pl-3",
                  activeId === heading.id
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted hover:text-foreground",
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
