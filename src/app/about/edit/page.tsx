import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AboutEditor } from "@/components/about-editor";
import { PageMotion, PageMotionSection } from "@/components/page-motion";
import { getAboutContent } from "@/lib/about";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Edit About",
  robots: { index: false, follow: false },
};

export default async function EditAboutPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/about/edit");
  if (!session.user.isAdmin) redirect("/about");

  const content = getAboutContent();

  return (
    <PageMotion className="mx-auto max-w-2xl px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
      <PageMotionSection>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-medium tracking-tight">
              Edit About
            </h1>
            <p className="mt-3 text-muted">
              Update the public about page. Contact links match the site footer.
            </p>
          </div>
          <Link
            href="/about"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            View live →
          </Link>
        </div>
      </PageMotionSection>

      <PageMotionSection className="mt-10">
        <AboutEditor initial={content} />
      </PageMotionSection>
    </PageMotion>
  );
}
