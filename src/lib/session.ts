import { auth } from "@/lib/auth";
import { userIsAdmin } from "@/lib/auth.config";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" as const, status: 401 as const, session: null };
  }
  if (!userIsAdmin(session.user)) {
    return { error: "Forbidden" as const, status: 403 as const, session: null };
  }
  return { session, error: null, status: null };
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" as const, status: 401 as const, session: null };
  }
  return { session, error: null, status: null };
}
