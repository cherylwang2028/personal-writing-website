import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isValidUsername, normalizeUsername } from "@/lib/user-display";

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(30),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signup details." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const username = normalizeUsername(parsed.data.username);

  if (!isValidUsername(username)) {
    return NextResponse.json(
      {
        error:
          "Username must be 2–30 characters: letters, numbers, and underscores only.",
      },
      { status: 400 },
    );
  }

  const taken = await prisma.user.findFirst({
    where: { username },
    select: { id: true },
  });
  if (taken) {
    return NextResponse.json({ error: "That username is taken." }, { status: 409 });
  }

  await prisma.pendingUsername.upsert({
    where: { email },
    create: { email, username },
    update: { username },
  });

  return NextResponse.json({ ok: true });
}
