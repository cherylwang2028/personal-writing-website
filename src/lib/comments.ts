import { prisma } from "@/lib/db";

export async function getRecentComments(limit = 8) {
  return prisma.comment.findMany({
    where: { article: { status: "published" }, recalledAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { name: true, email: true, username: true } },
      article: { select: { title: true, slug: true } },
    },
  });
}
