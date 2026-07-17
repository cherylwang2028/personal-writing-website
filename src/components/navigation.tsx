"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { siteConfig } from "@/lib/site";
import { userIsAdmin } from "@/lib/auth.config";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavSearch } from "@/components/nav-search";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  function requestSignOut() {
    setShowSignOutConfirm(true);
    setOpen(false);
  }

  async function confirmSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: "/" });
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const mainLinks = siteConfig.nav;

  const ownerLinks = session?.user && userIsAdmin(session.user)
    ? [{ href: "/studio", label: "Writing studio" }, { href: "/requests", label: "Requests" }]
    : [];

  const isStudioActive =
    pathname.startsWith("/studio") ||
    pathname.startsWith("/write") ||
    pathname.startsWith("/drafts");

  const authLink = session?.user ? null : { href: "/login", label: "Sign in" };
  const readerAccountLink =
    session?.user && !userIsAdmin(session.user)
      ? { href: "/account", label: "Account" }
      : null;

  const menuLinks = [
    ...mainLinks,
    ...ownerLinks,
    ...(readerAccountLink ? [readerAccountLink] : []),
    ...(authLink ? [authLink] : []),
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-border bg-nav backdrop-blur-xl"
          : "border-transparent bg-nav/60 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-5 sm:gap-3 sm:px-8">
        <Link
          href="/"
          className="shrink-0 font-serif text-[1.05rem] tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          {siteConfig.shortName}
        </Link>

        <NavSearch className="mx-1 max-md:flex-1 md:mx-2" />

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main"
        >
          {mainLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[0.8125rem] tracking-wide transition-colors duration-200",
                isActive(item.href)
                  ? "text-foreground"
                  : "text-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          {ownerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[0.8125rem] tracking-wide transition-colors duration-200",
                (item.href === "/studio" ? isStudioActive : isActive(item.href))
                  ? "text-foreground"
                  : "text-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}

          {authLink && (
            <Link
              href={authLink.href}
              className="rounded-md px-2.5 py-1.5 text-[0.8125rem] text-muted transition-colors hover:text-foreground"
            >
              {authLink.label}
            </Link>
          )}

          {readerAccountLink && (
            <Link
              href={readerAccountLink.href}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[0.8125rem] tracking-wide transition-colors duration-200",
                isActive(readerAccountLink.href)
                  ? "text-foreground"
                  : "text-muted hover:text-foreground",
              )}
            >
              {readerAccountLink.label}
            </Link>
          )}

          {session?.user && (
            <button
              type="button"
              onClick={requestSignOut}
              className="rounded-md px-2.5 py-1.5 text-[0.8125rem] text-muted transition-colors hover:text-foreground"
            >
              Sign out
            </button>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:text-foreground md:hidden"
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-border bg-background px-5 py-4 md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {menuLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded-md px-3 py-2.5 text-sm transition-colors",
                    (item.href === "/studio" ? isStudioActive : isActive(item.href))
                      ? "bg-accent-soft text-foreground"
                      : "text-muted hover:bg-card hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {session?.user && (
              <li>
                <button
                  type="button"
                  onClick={requestSignOut}
                  className="block w-full rounded-md px-3 py-2.5 text-left text-sm text-muted hover:bg-card hover:text-foreground"
                >
                  Sign out
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}

      <ConfirmDialog
        open={showSignOutConfirm}
        title="Sign out?"
        message="You will need to sign in again to like, comment, or open the writing studio."
        confirmLabel="Sign out"
        pendingLabel="Signing out…"
        tone="default"
        pending={signingOut}
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOutConfirm(false)}
      />
    </header>
  );
}
