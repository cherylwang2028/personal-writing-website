import type { Article } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/site";
import { slugify } from "@/lib/utils";
import type { Article as AppArticle, Heading } from "@/lib/types";

export type ArticleStatus = "draft" | "published";

export function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((t): t is string => typeof t === "string")
      : [];
  } catch {
    return [];
  }
}

export function extractHeadingsFromHtml(html: string): Heading[] {
  const headings: Heading[] = [];
  const regex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const level = Number(match[1]);
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    if (!text) continue;
    const id = slugify(text);
    headings.push({ id, text, level });
  }
  return headings;
}

export function toAppArticle(article: Article): AppArticle {
  return {
    slug: article.slug,
    title: article.title || "Untitled",
    subtitle: article.subtitle || undefined,
    summary: article.summary || "No summary yet.",
    date: (article.publishedAt ?? article.createdAt).toISOString(),
    updated: article.updatedAt.toISOString(),
    tags: parseTags(article.tags),
    collection: article.collection ?? undefined,
    project: article.project ?? undefined,
    author: siteConfig.author.name,
    draft: article.status === "draft",
    featured: false,
    content: article.html,
    readingTime: article.readingTime,
    headings: extractHeadingsFromHtml(article.html),
  };
}

export async function getPublishedArticles() {
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
  });
  return articles.map(toAppArticle);
}

export async function getPublishedArticleBySlug(slug: string) {
  const article = await prisma.article.findFirst({
    where: { slug, status: "published" },
  });
  return article ? toAppArticle(article) : null;
}

export async function getArticleRecordBySlug(slug: string) {
  return prisma.article.findUnique({ where: { slug } });
}

export async function getArticleById(id: string) {
  return prisma.article.findUnique({ where: { id } });
}

export async function getAuthorArticles(authorId: string) {
  return prisma.article.findMany({
    where: { authorId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getDrafts(authorId: string) {
  return prisma.article.findMany({
    where: { authorId, status: "draft" },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getArticlesByTag(tag: string) {
  const articles = await getPublishedArticles();
  const normalized = tag.toLowerCase();
  return articles.filter((a) =>
    a.tags.some((t) => t.toLowerCase() === normalized),
  );
}

export async function getArticlesByCollection(collectionSlug: string) {
  const articles = await prisma.article.findMany({
    where: { status: "published", collection: collectionSlug },
    orderBy: { publishedAt: "desc" },
  });
  return articles.map(toAppArticle);
}

export async function getArticlesByProject(projectSlug: string) {
  const articles = await prisma.article.findMany({
    where: { status: "published", project: projectSlug },
    orderBy: { publishedAt: "desc" },
  });
  return articles.map(toAppArticle);
}

export async function getRelatedArticles(article: AppArticle, limit = 3) {
  const all = await getPublishedArticles();
  return all
    .filter((a) => a.slug !== article.slug)
    .map((candidate) => {
      let score = 0;
      if (article.collection && candidate.collection === article.collection) {
        score += 3;
      }
      score += candidate.tags.filter((tag) => article.tags.includes(tag)).length;
      return { candidate, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export async function getAdjacentArticles(slug: string) {
  const articles = await getPublishedArticles();
  const index = articles.findIndex((a) => a.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: articles[index + 1] ?? null,
    next: articles[index - 1] ?? null,
  };
}

export async function getAllTags() {
  const articles = await getPublishedArticles();
  const counts = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export async function ensureUniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base) || "untitled";
  let candidate = root;
  let i = 2;
  while (true) {
    const existing = await prisma.article.findUnique({
      where: { slug: candidate },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${i}`;
    i += 1;
  }
}

export function estimateReadingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round((words / 200) * 10) / 10);
}
