import fs from "fs";
import path from "path";
import { siteConfig } from "@/lib/site";
import type { AboutContent } from "@/lib/types";

const aboutPath = path.join(process.cwd(), "content/about.json");

export const defaultAboutContent = (): AboutContent => ({
  bio: siteConfig.author.bio,
  intro:
    "This site is a digital library — a place to keep essays, research notes, and reflections in one calm room. It is meant to be read slowly.",
  interests: [
    "Institutional design and public decision-making",
    "The economics of attention and information",
    "How technology reshapes judgment and trust",
    "Philosophy of science as everyday practice",
  ],
  reading: [
    { title: "Seeing Like a State", author: "James C. Scott" },
    { title: "The Craft of Research", author: "Booth, Colomb & Williams" },
    { title: "Working in Public", author: "Nadia Eghbal" },
  ],
  inspirationIntro:
    "This site is independently designed. Its atmosphere owes a debt to tools and traditions that treat reading and writing with care:",
  inspirationDisclaimer:
    "Notion, Apple, GitHub, and the literary magazine tradition are trademarks of their respective owners. This site is not affiliated with or endorsed by them.",
});

export function getAboutContent(): AboutContent {
  if (!fs.existsSync(aboutPath)) {
    return defaultAboutContent();
  }

  try {
    const raw = fs.readFileSync(aboutPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<AboutContent>;
    const defaults = defaultAboutContent();
    return {
      bio: parsed.bio ?? defaults.bio,
      intro: parsed.intro ?? defaults.intro,
      interests: parsed.interests?.length ? parsed.interests : defaults.interests,
      reading: parsed.reading?.length ? parsed.reading : defaults.reading,
      inspirationIntro: parsed.inspirationIntro ?? defaults.inspirationIntro,
      inspirationDisclaimer:
        parsed.inspirationDisclaimer ?? defaults.inspirationDisclaimer,
    };
  } catch {
    return defaultAboutContent();
  }
}

export function saveAboutContent(content: AboutContent) {
  fs.mkdirSync(path.dirname(aboutPath), { recursive: true });
  fs.writeFileSync(aboutPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
}
