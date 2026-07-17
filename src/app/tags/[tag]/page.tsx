import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { PageMotion, PageMotionSection } from "@/components/page-motion";
import { getAllTags, getArticlesByTag } from "@/lib/articles";

type Props = { params: Promise<{ tag: string }> };

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map(({ tag }) => ({
    tag: tag.toLowerCase(),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded}`,
    description: `Articles tagged ${decoded}`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const articles = await getArticlesByTag(decoded);

  if (articles.length === 0) notFound();

  const displayTag =
    articles
      .flatMap((a) => a.tags)
      .find((t) => t.toLowerCase() === decoded.toLowerCase()) ?? decoded;

  return (
    <PageMotion className="mx-auto max-w-5xl px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
      <PageMotionSection>
        <header className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.12em] text-muted-fg">Tag</p>
          <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
            {displayTag}
          </h1>
          <p className="mt-4 text-muted">
            {articles.length} article{articles.length === 1 ? "" : "s"}
          </p>
        </header>
      </PageMotionSection>

      <PageMotionSection className="mt-12 divide-y divide-border border-t border-border">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </PageMotionSection>
    </PageMotion>
  );
}
