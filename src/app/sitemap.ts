import type { MetadataRoute } from "next";
import { getAllArticles, getAllTags } from "@/lib/articles";
import { getCollections } from "@/lib/collections";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/writing",
    "/collections",
    "/about",
    "/search",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/writing" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const [articlesList, tags] = await Promise.all([
    getAllArticles(),
    getAllTags(),
  ]);

  const articles = articlesList.map((article) => ({
    url: `${base}/writing/${article.slug}`,
    lastModified: new Date(article.updated ?? article.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const collections = getCollections().map((collection) => ({
    url: `${base}/collections/${collection.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const tagRoutes = tags.map(({ tag }) => ({
    url: `${base}/tags/${encodeURIComponent(tag.toLowerCase())}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  return [...staticRoutes, ...articles, ...collections, ...tagRoutes];
}
