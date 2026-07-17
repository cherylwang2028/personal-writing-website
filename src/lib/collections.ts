import fs from "fs";
import path from "path";
import type { CollectionMeta } from "@/lib/types";
import { getArticlesByCollection } from "@/lib/articles-db";

const collectionsPath = path.join(process.cwd(), "content/collections.json");

export function getCollections(): CollectionMeta[] {
  if (!fs.existsSync(collectionsPath)) return [];
  const raw = fs.readFileSync(collectionsPath, "utf8");
  const collections = JSON.parse(raw) as CollectionMeta[];
  return collections.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getCollectionBySlug(slug: string): CollectionMeta | null {
  return getCollections().find((c) => c.slug === slug) ?? null;
}

export function saveCollections(collections: CollectionMeta[]) {
  const sorted = [...collections].sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99),
  );
  fs.mkdirSync(path.dirname(collectionsPath), { recursive: true });
  fs.writeFileSync(
    collectionsPath,
    `${JSON.stringify(sorted, null, 2)}\n`,
    "utf8",
  );
}

export async function getCollectionsWithCounts() {
  const collections = getCollections();
  return Promise.all(
    collections.map(async (collection) => ({
      ...collection,
      count: (await getArticlesByCollection(collection.slug)).length,
    })),
  );
}
