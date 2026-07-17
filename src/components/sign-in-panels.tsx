"use client";

import { Suspense, useState } from "react";
import { LoginForm } from "@/components/login-form";
import { OwnerLoginForm } from "@/components/owner-login-form";

export function SignInPanels({
  error,
  ownerError,
}: {
  error?: string;
  ownerError?: string | null;
}) {
  const [showOwner, setShowOwner] = useState(
    ownerError != null || error === "OwnerPassword",
  );

  return (
    <section className="mt-10 rounded-xl border border-border p-6">
      <h2 className="font-serif text-xl tracking-tight">
        {showOwner ? "Site owner" : "Readers"}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {showOwner
          ? "Sign in to write and publish."
          : "Sign in with email to like and comment. New readers choose a username when creating an account."}
      </p>

      <div className="mt-6">
        {showOwner ? (
          <Suspense fallback={<div className="h-32 animate-pulse rounded-md bg-card" />}>
            {ownerError && (
              <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                {ownerError}
              </p>
            )}
            <OwnerLoginForm />
            <p className="mt-4 text-sm text-muted">
              <button
                type="button"
                onClick={() => setShowOwner(false)}
                className="text-accent hover:opacity-70"
              >
                ← Back to reader sign in
              </button>
            </p>
          </Suspense>
        ) : (
          <Suspense fallback={<div className="h-32 animate-pulse rounded-md bg-card" />}>
            <LoginForm
              error={error}
              mode="signin"
              onOwnerSignIn={() => setShowOwner(true)}
            />
          </Suspense>
        )}
      </div>
    </section>
  );
}
