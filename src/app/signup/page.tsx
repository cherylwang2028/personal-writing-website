import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LoginForm } from "@/components/login-form";
import { PageMotion, PageMotionSection } from "@/components/page-motion";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const session = await auth();
  if (session?.user?.isAdmin) redirect("/studio");
  if (session?.user) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true },
    });
    if (!user?.username) redirect("/account/setup");
    redirect("/writing");
  }

  const params = await searchParams;

  return (
    <PageMotion className="mx-auto max-w-md px-5 pb-24 pt-20 sm:px-8">
      <PageMotionSection>
        <h1 className="font-serif text-4xl font-medium tracking-tight">
          Create account
        </h1>
        <p className="mt-3 text-muted">
          Choose a username and enter your email. We&apos;ll send a link to finish
          creating your account.
        </p>
      </PageMotionSection>
      <PageMotionSection className="mt-10">
        <Suspense
          fallback={<div className="h-40 animate-pulse rounded-md bg-card" />}
        >
          <LoginForm error={params.error} mode="signup" />
        </Suspense>
      </PageMotionSection>
    </PageMotion>
  );
}
