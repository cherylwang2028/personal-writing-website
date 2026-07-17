import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import type { ReactElement } from "react";
import { mdxComponents } from "@/components/mdx-components";

export async function renderMDX(source: string): Promise<ReactElement> {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: {
                className: ["anchor"],
              },
            },
          ],
          rehypeKatex,
          [
            rehypePrettyCode,
            {
              theme: {
                light: "github-light",
                dark: "github-dark",
              },
              keepBackground: false,
            },
          ],
        ],
      },
    },
  });

  return content;
}

export function extractHeadings(content: string) {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: { id: string; text: string; level: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`~]/g, "")
      .trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ id, text, level });
  }

  return headings;
}
