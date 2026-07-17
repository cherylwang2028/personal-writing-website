import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { userIsAdmin } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import { MarkRepliedButton } from "@/components/mark-replied-button";
import { PageMotion, PageMotionSection } from "@/components/page-motion";

export const metadata: Metadata = {
  title: "Requests",
  robots: { index: false, follow: false },
};

export default async function RequestsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/requests");
  if (!userIsAdmin(session.user)) redirect("/contact");

  const requests = await prisma.contactRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } } },
  });

  const pending = requests.filter((r) => r.status === "pending");
  const replied = requests.filter((r) => r.status === "replied");

  return (
    <PageMotion className="mx-auto max-w-3xl px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
      <PageMotionSection>
        <h1 className="font-serif text-4xl font-medium tracking-tight">
          Contact requests
        </h1>
        <p className="mt-3 text-muted">
          Messages from signed-in readers. Reply by email, then mark as answered.
        </p>
      </PageMotionSection>

      {pending.length === 0 && replied.length === 0 ? (
        <PageMotionSection className="mt-12 text-muted">
          No requests yet.
        </PageMotionSection>
      ) : (
        <div className="mt-12 space-y-12">
          {pending.length > 0 && (
            <PageMotionSection>
              <h2 className="font-serif text-2xl tracking-tight">
                Pending ({pending.length})
              </h2>
              <ul className="mt-6 divide-y divide-border border-t border-border">
                {pending.map((req) => (
                  <li key={req.id} className="py-6">
                    <RequestCard req={req} />
                  </li>
                ))}
              </ul>
            </PageMotionSection>
          )}

          {replied.length > 0 && (
            <PageMotionSection>
              <h2 className="font-serif text-2xl tracking-tight text-muted">
                Replied ({replied.length})
              </h2>
              <ul className="mt-6 divide-y divide-border border-t border-border">
                {replied.map((req) => (
                  <li key={req.id} className="py-6 opacity-80">
                    <RequestCard req={req} />
                  </li>
                ))}
              </ul>
            </PageMotionSection>
          )}
        </div>
      )}

      <PageMotionSection className="mt-10">
        <Link
          href="/contact"
          className="inline-block text-sm text-muted hover:text-foreground"
        >
          ← Back to Contact Me
        </Link>
      </PageMotionSection>
    </PageMotion>
  );
}

function RequestCard({
  req,
}: {
  req: {
    id: string;
    name: string;
    contactEmail: string;
    reason: string;
    status: string;
    createdAt: Date;
    repliedAt: Date | null;
    user: { email: string };
  };
}) {
  const subject = encodeURIComponent("Re: Your message to Cheryl Wang");
  const body = encodeURIComponent(
    `Hi ${req.name},\n\nThank you for reaching out.\n\n— Cheryl\n\n---\nYour message:\n${req.reason}`,
  );
  const mailto = `mailto:${req.contactEmail}?subject=${subject}&body=${body}`;

  return (
    <article>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-xl tracking-tight">{req.name}</h3>
        <time className="text-sm text-muted-fg" dateTime={req.createdAt.toISOString()}>
          {formatDate(req.createdAt)}
        </time>
      </div>
      <p className="mt-1 text-sm text-muted">
        Contact:{" "}
        <a href={`mailto:${req.contactEmail}`} className="text-accent hover:opacity-70">
          {req.contactEmail}
        </a>
        <span className="text-muted-fg"> · signed in as {req.user.email}</span>
      </p>
      <p className="mt-4 whitespace-pre-wrap leading-relaxed text-foreground">
        {req.reason}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href={mailto}
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
        >
          Send my email
        </a>
        {req.status === "pending" && <MarkRepliedButton id={req.id} />}
        {req.status === "replied" && req.repliedAt && (
          <span className="text-sm text-muted-fg">
            Replied {formatDate(req.repliedAt)}
          </span>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-fg">
        “Send my email” opens your mail app with a reply draft to {req.contactEmail}.
        Your address: {siteConfig.author.email}
      </p>
    </article>
  );
}
