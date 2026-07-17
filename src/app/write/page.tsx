import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { userIsAdmin } from "@/lib/auth.config";
import { WritingWorkspace } from "@/components/writing-workspace";
import { getCollections } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Write",
  robots: { index: false, follow: false },
};

export default async function WritePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!userIsAdmin(session.user)) redirect("/writing?notice=writer-only");

  return <WritingWorkspace collections={getCollections()} />;
}
