import type { Metadata } from "next";
import { PageMotion, PageMotionSection } from "@/components/page-motion";
import { SearchExperience } from "@/components/search-experience";
import { getAllArticles } from "@/lib/articles";
import { getCollections } from "@/lib/collections";
import { buildSearchIndex } from "@/lib/search";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Search",
  description: "Search essays, tags, collections, and full text.",
};

export default async function SearchPage() {
  const [articles, published] = await Promise.all([
    getAllArticles(),
    prisma.article.findMany({
      where: { status: "published" },
      select: { slug: true, plainText: true },
    }),
  ]);

  const plainBySlug = new Map(published.map((a) => [a.slug, a.plainText]));
  const searchable = articles.map((article) => ({
    ...article,
    content: plainBySlug.get(article.slug) ?? article.content,
  }));

  const documents = buildSearchIndex(searchable, getCollections());

  return (
    <PageMotion className="mx-auto max-w-3xl px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
      <PageMotionSection>
        <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Search
        </h1>
      </PageMotionSection>
      <PageMotionSection className="mt-8">
        <SearchExperience documents={documents} />
      </PageMotionSection>
    </PageMotion>
  );
}
