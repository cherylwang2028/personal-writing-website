import type { NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import Resend from "next-auth/providers/resend";

function getProviders(): Provider[] {
  const from = process.env.EMAIL_FROM ?? "Documented <onboarding@resend.dev>";

  if (process.env.AUTH_RESEND_KEY) {
    return [
      Resend({
        apiKey: process.env.AUTH_RESEND_KEY,
        from,
      }),
    ];
  }

  return [
    {
      id: "resend",
      name: "Email",
      type: "email",
      from,
      maxAge: 24 * 60 * 60,
      async sendVerificationRequest({ identifier, url }) {
        console.log("\n────────────────────────────────────────");
        console.log(`Magic link for ${identifier}:`);
        console.log(url);
        console.log("────────────────────────────────────────\n");
      },
    } satisfies Provider,
  ];
}

export function isAdminEmail(email?: string | null) {
  const admin = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  if (!admin || !email) return false;
  return email.toLowerCase().trim() === admin;
}

export function userIsAdmin(user?: {
  isAdmin?: boolean;
  email?: string | null;
}) {
  if (!user) return false;
  if (user.isAdmin) return true;
  return isAdminEmail(user.email);
}

/**
 * Edge-safe auth config (no Prisma). Used by middleware.
 * Anyone may sign in with email; only the owner uses password to publish.
 */
export const authConfig = {
  providers: getProviders(),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login/check-email",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Owner must use password — not magic link
      if (isAdminEmail(user.email) && account?.provider !== "credentials") {
        return "/login?error=OwnerPassword";
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      const email = (user?.email ?? token.email) as string | undefined;
      if (email) {
        token.email = email;
      }
      // Set on sign-in (Node). Preserve on later refreshes — Edge middleware may
      // not have ADMIN_EMAIL, which would otherwise clear isAdmin every request.
      if (user) {
        token.isAdmin = isAdminEmail(user.email);
      } else if (typeof token.isAdmin !== "boolean") {
        token.isAdmin = isAdminEmail(token.email as string | undefined);
      } else if (
        !token.isAdmin &&
        isAdminEmail(token.email as string | undefined)
      ) {
        token.isAdmin = true;
      }
      if (email && isAdminEmail(email)) {
        token.isAdmin = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        session.user.isAdmin =
          Boolean(token.isAdmin) || isAdminEmail(session.user.email);
      }
      return session;
    },
    authorized({ auth, request }) {
      void auth;
      void request;
      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
