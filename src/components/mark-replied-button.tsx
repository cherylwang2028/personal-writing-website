"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkRepliedButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function markReplied() {
    setPending(true);
    await fetch(`/api/contact/${id}/replied`, { method: "POST" });
    router.refresh();
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={markReplied}
      disabled={pending}
      className="rounded-md border border-border px-4 py-2 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-50"
    >
      {pending ? "Saving…" : "Mark as replied"}
    </button>
  );
}
