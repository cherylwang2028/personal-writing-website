import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/** Edge middleware auth — no email providers (they require a DB adapter). */
const { auth } = NextAuth({
  ...authConfig,
  providers: [],
});

export default auth((req) => {
  const path = req.nextUrl.pathname;

  const ownerRoute =
    path.startsWith("/write") ||
    path.startsWith("/studio") ||
    path.startsWith("/drafts") ||
    path.startsWith("/about/edit") ||
    path.startsWith("/collections/edit") ||
    path.startsWith("/requests");

  if (ownerRoute || path === "/contact") {
    if (!req.auth) {
      const login = new URL("/login", req.nextUrl.origin);
      login.searchParams.set("callbackUrl", path);
      return Response.redirect(login);
    }
  }
});

export const config = {
  matcher: [
    "/write",
    "/write/:path*",
    "/studio",
    "/drafts",
    "/drafts/:path*",
    "/about/edit",
    "/collections/edit",
    "/requests",
    "/requests/:path*",
    "/contact",
  ],
};
