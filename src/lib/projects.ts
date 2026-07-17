import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Project, ProjectFrontmatter } from "@/lib/types";

const projectsDirectory = path.join(process.cwd(), "content/projects");

function ensureDirectory() {
  if (!fs.existsSync(projectsDirectory)) {
    fs.mkdirSync(projectsDirectory, { recursive: true });
  }
}

export function getProjectSlugs(): string[] {
  ensureDirectory();
  return fs
    .readdirSync(projectsDirectory)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx?$/, ""));
}

export function getProjectBySlug(slug: string): Project | null {
  ensureDirectory();
  const mdxPath = path.join(projectsDirectory, `${slug}.mdx`);
  const mdPath = path.join(projectsDirectory, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath)
    ? mdxPath
    : fs.existsSync(mdPath)
      ? mdPath
      : null;

  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = data as ProjectFrontmatter;

  return {
    slug,
    title: frontmatter.title,
    description: frontmatter.description,
    status: frontmatter.status,
    startDate: frontmatter.startDate,
    endDate: frontmatter.endDate,
    links: frontmatter.links ?? [],
    relatedArticles: frontmatter.relatedArticles ?? [],
    tags: frontmatter.tags ?? [],
    content,
  };
}

export function getAllProjects(): Project[] {
  return getProjectSlugs()
    .map((slug) => getProjectBySlug(slug))
    .filter((project): project is Project => project !== null)
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );
}
