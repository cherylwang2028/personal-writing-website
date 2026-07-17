import type { Metadata } from "next";
import Link from "next/link";
import { getAboutContent } from "@/lib/about";
import { siteConfig } from "@/lib/site";
import { auth } from "@/lib/auth";
import { userIsAdmin } from "@/lib/auth.config";
import { PageMotion, PageMotionSection } from "@/components/page-motion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.author.name}`,
};

export default async function AboutPage() {
  const [content, session] = await Promise.all([getAboutContent(), auth()]);
  const canEdit = userIsAdmin(session?.user);

  return (
    <PageMotion className="mx-auto max-w-prose-wide px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
      <PageMotionSection>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">
            About
          </h1>
          {canEdit && (
            <Link
              href="/about/edit"
              className="rounded-md border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-card hover:text-foreground"
            >
              Edit page
            </Link>
          )}
        </div>
      </PageMotionSection>

      <PageMotionSection className="mt-10 space-y-5 text-lg leading-relaxed text-muted">
        <p className="text-foreground">{content.bio}</p>
        <p>{content.intro}</p>
      </PageMotionSection>

      <PageMotionSection className="mt-16 border-t border-border pt-12">
        <h2 className="font-serif text-2xl tracking-tight">Current interests</h2>
        <ul className="mt-4 space-y-2 text-muted">
          {content.interests.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </PageMotionSection>

      <PageMotionSection className="mt-14">
        <h2 className="font-serif text-2xl tracking-tight">Currently reading</h2>
        <ul className="mt-4 space-y-3 text-muted">
          {content.reading.map((book) => (
            <li key={`${book.title}-${book.author}`}>
              <span className="text-foreground">{book.title}</span>
              <span className="text-muted-fg"> — {book.author}</span>
            </li>
          ))}
        </ul>
      </PageMotionSection>

      <PageMotionSection className="mt-14 border-t border-border pt-12">
        <h2 className="font-serif text-2xl tracking-tight">Contact Me</h2>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-muted">
          {siteConfig.footerLinks.map((link) => (
            <li key={link.href}>
              {"external" in link && link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-accent"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  href={link.href}
                  className="transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </PageMotionSection>

      <PageMotionSection id="inspiration" className="mt-14 scroll-mt-24 border-t border-border pt-12">
        <h2 className="font-serif text-2xl tracking-tight">Inspiration</h2>
        <p className="mt-4 text-muted">{content.inspirationIntro}</p>
        <ul className="mt-5 space-y-3 text-muted">
          {siteConfig.inspirations.map((item) => (
            <li key={item.name}>
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground transition-colors hover:text-accent"
                >
                  {item.name}
                </a>
              ) : (
                <span className="text-foreground">{item.name}</span>
              )}
              <span className="text-muted-fg"> — {item.note}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-muted-fg">
          {content.inspirationDisclaimer}
        </p>
      </PageMotionSection>
    </PageMotion>
  );
}
