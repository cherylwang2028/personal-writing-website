import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { userIsAdmin } from "@/lib/auth.config";
import { ContactForm } from "@/components/contact-form";
import { PageMotion, PageMotionSection } from "@/components/page-motion";

export const metadata: Metadata = {
  title: "Contact Me",
  robots: { index: false, follow: false },
};

export default async function ContactPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/contact");
  }

  return (
    <PageMotion className="mx-auto max-w-lg px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
      <PageMotionSection>
        <h1 className="font-serif text-4xl font-medium tracking-tight">
          Contact Me
        </h1>
        <p className="mt-3 text-muted">
          Send Cheryl a note. All fields are required.
        </p>
      </PageMotionSection>
      <PageMotionSection className="mt-10 rounded-xl border border-border bg-background p-6 sm:p-8">
        <ContactForm defaultName={session.user.name} />
      </PageMotionSection>
      {userIsAdmin(session.user) && (
        <PageMotionSection className="mt-6">
          <p className="text-sm text-muted">
            <Link href="/requests" className="text-accent hover:opacity-70">
              View incoming requests →
            </Link>
          </p>
        </PageMotionSection>
      )}
    </PageMotion>
  );
}
