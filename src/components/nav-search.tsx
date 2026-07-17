"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function NavSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("relative min-w-0 flex-1 md:flex-none", className)}
      role="search"
    >
      <label htmlFor="nav-search" className="sr-only">
        Search
      </label>
      <svg
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-fg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3-3" />
      </svg>
      <input
        id="nav-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search…"
        className="w-full rounded-md border border-border bg-card/80 py-1.5 pl-8 pr-2.5 text-[0.8125rem] text-foreground outline-none transition-[border-color] placeholder:text-muted-fg focus:border-accent md:w-40 md:focus:w-56 lg:w-48 lg:focus:w-64"
      />
    </form>
  );
}
