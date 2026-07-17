import { Feed } from "feed";
import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await getAllArticles();

  const feed = new Feed({
    title: siteConfig.shortName,
    description: siteConfig.description,
    id: siteConfig.url,
    link: siteConfig.url,
    language: "en",
    favicon: `${siteConfig.url}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${siteConfig.author.name}`,
    author: {
      name: siteConfig.author.name,
      email: siteConfig.author.email,
      link: siteConfig.url,
    },
  });

  for (const article of articles) {
    feed.addItem({
      title: article.title,
      id: `${siteConfig.url}/writing/${article.slug}`,
      link: `${siteConfig.url}/writing/${article.slug}`,
      description: article.summary,
      content: article.summary,
      date: new Date(article.date),
      author: [
        {
          name: article.author ?? siteConfig.author.name,
          email: siteConfig.author.email,
        },
      ],
      category: article.tags.map((tag) => ({ name: tag })),
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=60, stale-while-revalidate",
    },
  });
}
