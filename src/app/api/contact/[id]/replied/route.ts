import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { session, error, status } = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error }, { status: status ?? 401 });
  }

  const { id } = await params;
  const existing = await prisma.contactRequest.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contactRequest = await prisma.contactRequest.update({
    where: { id },
    data: { status: "replied", repliedAt: new Date() },
  });

  return NextResponse.json({ contactRequest });
}
