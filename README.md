# Documented
Documented, a place where ideas can live.
A personal writing website with a Notion-like editor. Only you can sign in and publish; visitors read what you choose to share.

**Stack:** Next.js · TypeScript · Tailwind · BlockNote · Auth.js (email magic link) · Prisma (SQLite)

## Getting started

```bash
cp .env.example .env
# Set ADMIN_EMAIL to your email
# AUTH_SECRET is already generated in .env if you used the project setup

npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Write & publish

1. Click **Sign in** and enter your `ADMIN_EMAIL`
2. Without Resend configured, copy the magic link from the terminal
3. Open **Write** — a Notion-style blank page
4. **Save draft** (private) or **Publish** (public on `/writing`)
5. Edit anytime from **Drafts** or the **Edit** link on a live article

## Email login (production)

1. Create a free [Resend](https://resend.com) account
2. Set in `.env` / Vercel:

```env
AUTH_RESEND_KEY=re_...
EMAIL_FROM="Your Name <you@yourdomain.com>"
ADMIN_EMAIL=you@yourdomain.com
AUTH_SECRET=...
AUTH_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Only `ADMIN_EMAIL` can sign in.

## Collections

Edit `content/collections.json`. Assign a collection on each piece in the editor.

## Library & projects

- Library: `content/library.json`
- Projects: Markdown files in `content/projects/` (optional)

## Deploy notes

Local SQLite (`file:./dev.db`) is fine for development. For Vercel, switch Prisma to Postgres (e.g. Neon) and update `DATABASE_URL` — serverless hosts cannot keep a durable local SQLite file.
