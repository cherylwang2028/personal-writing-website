"use client";

import dynamic from "next/dynamic";

export const NotionEditor = dynamic(() => import("./notion-editor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[40vh] animate-pulse rounded-md bg-card/60" />
  ),
});
