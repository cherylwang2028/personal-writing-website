import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} {siteConfig.author.name}
          </p>
          <div className="flex items-center gap-5 text-sm text-muted">
            {siteConfig.footerLinks.map((link) =>
              "external" in link && link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>
        </div>
        <p className="text-[0.75rem] leading-relaxed text-muted-fg">
          Design inspired by Notion, Apple, GitHub Docs, and independent
          magazines — with gratitude, and without affiliation.
        </p>
      </div>
    </footer>
  );
}
