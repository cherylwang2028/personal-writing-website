"use client";

import { useEffect, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { Block } from "@blocknote/core";
import { useTheme } from "next-themes";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

export type EditorApi = {
  getDocument: () => Block[];
  blocksToHTML: () => Promise<string>;
  blocksToPlainText: () => Promise<string>;
};

type NotionEditorProps = {
  initialContent?: Block[];
  editable?: boolean;
  onReady?: (api: EditorApi) => void;
};

export default function NotionEditor({
  initialContent,
  editable = true,
  onReady,
}: NotionEditorProps) {
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = useState(false);

  const editor = useCreateBlockNote({
    // Only pass initial content when present — avoid remounting on every render
    ...(initialContent ? { initialContent } : {}),
  });

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!onReady || !ready) return;
    onReady({
      getDocument: () => editor.document,
      blocksToHTML: async () =>
        await Promise.resolve(editor.blocksToHTMLLossy(editor.document)),
      blocksToPlainText: async () =>
        await Promise.resolve(editor.blocksToMarkdownLossy(editor.document)),
    });
  }, [editor, onReady, ready]);

  if (!ready) {
    return (
      <div className="min-h-[50vh] animate-pulse rounded-md bg-card/50" />
    );
  }

  return (
    <div className="notion-editor relative z-0 min-h-[50vh]">
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        slashMenu
        formattingToolbar
        sideMenu
      />
    </div>
  );
}
