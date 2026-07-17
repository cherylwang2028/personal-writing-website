export type ArticleFrontmatter = {
  title: string;
  subtitle?: string;
  summary: string;
  date: string;
  updated?: string;
  tags: string[];
  collection?: string;
  project?: string;
  author?: string;
  draft?: boolean;
  featured?: boolean;
};

export type Article = ArticleFrontmatter & {
  slug: string;
  content: string;
  readingTime: number;
  headings: Heading[];
};

export type Heading = {
  id: string;
  text: string;
  level: number;
};

export type ProjectFrontmatter = {
  title: string;
  description: string;
  status: "active" | "completed" | "paused" | "archived";
  startDate: string;
  endDate?: string;
  links?: { label: string; url: string }[];
  relatedArticles?: string[];
  tags?: string[];
};

export type Project = ProjectFrontmatter & {
  slug: string;
  content: string;
};

export type LibraryEntry = {
  title: string;
  type: "book" | "paper" | "quote" | "idea";
  author?: string;
  year?: string | number;
  source?: string;
  notes?: string;
  tags?: string[];
  date?: string;
  url?: string;
};

export type CollectionMeta = {
  slug: string;
  title: string;
  description: string;
  order?: number;
};

export type AboutReading = {
  title: string;
  author: string;
};

export type AboutContent = {
  bio: string;
  intro: string;
  interests: string[];
  reading: AboutReading[];
  inspirationIntro: string;
  inspirationDisclaimer: string;
};
