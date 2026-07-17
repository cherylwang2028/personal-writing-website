export const siteConfig = {
  name: "Life, documented beautifully.",
  shortName: "Documented",
  description:
    "Essays, research, reflections, and notes on economics, public policy, philosophy, technology, and everyday curiosity.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  author: {
    name: "Cheryl Wang",
    email: "hello@example.com",
    bio: "Writer and researcher exploring how ideas shape public life — from markets and institutions to technology and everyday judgment.",
  },
  social: {
    twitter: "https://twitter.com",
    github: "https://github.com/cherylwang2028",
    email: "mailto:hello@example.com",
  },
  inspirations: [
    {
      name: "Notion",
      url: "https://www.notion.so",
      note: "calm documents and the joy of typing into a blank page",
    },
    {
      name: "Apple",
      url: "https://www.apple.com",
      note: "restraint, typography, and long-lived clarity",
    },
    {
      name: "GitHub",
      url: "https://github.com",
      note: "documentation that stays out of the way",
    },
    {
      name: "Independent magazines",
      url: null,
      note: "the pace and presence of literary reading",
    },
  ],
  nav: [
    { href: "/", label: "Home" },
    { href: "/writing", label: "Writing" },
    { href: "/collections", label: "Collections" },
    { href: "/about", label: "About" },
  ],
  footerLinks: [
    { href: "/about#inspiration", label: "Inspiration" },
    { href: "/feed.xml", label: "RSS" },
    { href: "https://github.com/cherylwang2028", label: "GitHub", external: true },
    { href: "/contact", label: "Contact Me" },
  ],
} as const;
