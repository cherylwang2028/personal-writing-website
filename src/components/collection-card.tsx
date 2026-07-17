import Link from "next/link";
import type { CollectionMeta } from "@/lib/types";

type CollectionCardProps = {
  collection: CollectionMeta & { count: number };
};

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group flex w-full flex-col py-5 transition-colors duration-300 sm:py-6"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="min-w-0 font-serif text-xl tracking-tight text-foreground transition-colors duration-300 group-hover:text-accent">
          {collection.title}
        </h3>
        <span className="shrink-0 text-sm tabular-nums text-muted-fg">
          {collection.count}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {collection.description}
      </p>
    </Link>
  );
}
