import fs from "fs";
import path from "path";
import type { LibraryEntry } from "@/lib/types";

const libraryPath = path.join(process.cwd(), "content/library.json");

export function getLibraryEntries(): LibraryEntry[] {
  if (!fs.existsSync(libraryPath)) return [];
  const raw = fs.readFileSync(libraryPath, "utf8");
  return JSON.parse(raw) as LibraryEntry[];
}

export function getLibraryByType(type: LibraryEntry["type"]): LibraryEntry[] {
  return getLibraryEntries().filter((entry) => entry.type === type);
}

export const librarySections: {
  type: LibraryEntry["type"];
  title: string;
  description: string;
}[] = [
  {
    type: "book",
    title: "Books",
    description: "Works that shaped how I see the world.",
  },
  {
    type: "paper",
    title: "Papers",
    description: "Research worth returning to.",
  },
  {
    type: "quote",
    title: "Quotes",
    description: "Lines that refuse to leave.",
  },
  {
    type: "idea",
    title: "Ideas",
    description: "Seeds of thought still unfolding.",
  },
];
