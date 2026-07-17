import type { Article } from "@/lib/types";
import type { CollectionMeta } from "@/lib/types";

export type SearchDocument = {
  id: string;
  type: "article" | "collection";
  title: string;
  subtitle?: string;
  summary: string;
  content: string;
  tags: string[];
  collection?: string;
  date?: string;
  slug: string;
  href: string;
  readingTime?: number;
};

export function buildSearchIndex(
  articles: Article[],
  collections: CollectionMeta[],
): SearchDocument[] {
  const articleDocs: SearchDocument[] = articles.map((article) => ({
    id: `article:${article.slug}`,
    type: "article" as const,
    title: article.title,
    subtitle: article.subtitle,
    summary: article.summary,
    content: article.content,
    tags: article.tags,
    collection: article.collection,
    date: article.date,
    slug: article.slug,
    href: `/writing/${article.slug}`,
    readingTime: article.readingTime,
  }));

  const collectionDocs: SearchDocument[] = collections.map((collection) => ({
    id: `collection:${collection.slug}`,
    type: "collection" as const,
    title: collection.title,
    summary: collection.description,
    content: collection.description,
    tags: [],
    slug: collection.slug,
    href: `/collections/${collection.slug}`,
  }));

  return [...articleDocs, ...collectionDocs];
}
