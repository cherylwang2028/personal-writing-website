import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

const schema = z.object({
  name: z.string().min(1).max(200),
  contactEmail: z.string().email(),
  reason: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  const { session, error, status } = await requireUser();
  if (!session) {
    return NextResponse.json({ error }, { status: status ?? 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 },
    );
  }

  const contactRequest = await prisma.contactRequest.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name.trim(),
      contactEmail: parsed.data.contactEmail.trim(),
      reason: parsed.data.reason.trim(),
    },
  });

  return NextResponse.json({ contactRequest }, { status: 201 });
}
