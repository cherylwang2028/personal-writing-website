import type { Block } from "@blocknote/core";

export function parseBlocks(raw: string): Block[] | undefined {
  try {
    const parsed = JSON.parse(raw) as Block[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined;
  } catch {
    return undefined;
  }
}
