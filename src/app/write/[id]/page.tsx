import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { userIsAdmin } from "@/lib/auth.config";
import { WritingWorkspace } from "@/components/writing-workspace";
import { getArticleById } from "@/lib/articles-db";
import { getCollections } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Edit",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!userIsAdmin(session.user)) redirect("/writing?notice=writer-only");

  const { id } = await params;
  const article = await getArticleById(id);
  if (!article || article.authorId !== session.user.id) notFound();

  return (
    <WritingWorkspace
      collections={getCollections()}
      article={{
        id: article.id,
        title: article.title,
        subtitle: article.subtitle,
        summary: article.summary,
        content: article.content,
        tags: article.tags,
        collection: article.collection,
        status: article.status,
        slug: article.slug,
      }}
    />
  );
}
