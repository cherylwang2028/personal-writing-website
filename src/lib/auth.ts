import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getAdminPasswordHash } from "@/lib/admin-password";
import { authConfig, isAdminEmail } from "@/lib/auth.config";

async function loadUsername(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });
  return user?.username ?? null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  events: {
    async createUser({ user }) {
      if (!user.email) return;

      const pending = await prisma.pendingUsername.findUnique({
        where: { email: user.email.toLowerCase() },
      });
      if (!pending) return;

      await prisma.user.update({
        where: { id: user.id },
        data: { username: pending.username },
      });
      await prisma.pendingUsername.delete({
        where: { email: user.email.toLowerCase() },
      });
    },
  },
  providers: [
    ...authConfig.providers,
    Credentials({
      id: "credentials",
      name: "Owner password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString();

        if (!email || !password || !isAdminEmail(email)) {
          return null;
        }

        const hash = getAdminPasswordHash();
        if (!hash) {
          console.error("ADMIN_PASSWORD_HASH_B64 is not set");
          return null;
        }

        const valid = await bcrypt.compare(password, hash);
        if (!valid) return null;

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              emailVerified: new Date(),
              name: "Cheryl Wang",
              username: "cherylwang",
            },
          });
        } else if (!user.username) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { username: "cherylwang" },
          });
        }

        return user;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      const nextToken = await authConfig.callbacks.jwt({ token, user });

      if (user?.id) {
        nextToken.username = await loadUsername(user.id);
      } else if (trigger === "update") {
        if (typeof session?.username === "string") {
          nextToken.username = session.username;
        } else if (nextToken.sub) {
          nextToken.username = await loadUsername(nextToken.sub);
        }
      } else if (typeof nextToken.username !== "string" && nextToken.sub) {
        nextToken.username = await loadUsername(nextToken.sub);
      }

      return nextToken;
    },
    async session({ session, token }) {
      const nextSession = await authConfig.callbacks.session({ session, token });
      if (nextSession.user) {
        nextSession.user.username =
          typeof token.username === "string" ? token.username : null;
      }
      return nextSession;
    },
  },
});
