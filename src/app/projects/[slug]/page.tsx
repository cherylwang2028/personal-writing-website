import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function ProjectPage({ params }: Props) {
  await params;
  redirect("/");
}
