import Link from "next/link";
import type { Project } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";

const statusLabel: Record<Project["status"], string> = {
  active: "Active",
  completed: "Completed",
  paused: "Paused",
  archived: "Archived",
};

export function ProjectCard({ project }: { project: Project }) {
  const timeline = project.endDate
    ? `${formatDate(project.startDate)} – ${formatDate(project.endDate)}`
    : `${formatDate(project.startDate)} – Present`;

  return (
    <article className="border-b border-border py-8 last:border-b-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8rem] text-muted">
        <span
          className={cn(
            "rounded-md px-2 py-0.5",
            project.status === "active" && "bg-accent-soft text-accent",
            project.status !== "active" && "bg-card text-muted",
          )}
        >
          {statusLabel[project.status]}
        </span>
        <span aria-hidden className="text-muted-fg">
          ·
        </span>
        <span>{timeline}</span>
      </div>

      <h2 className="mt-3 font-serif text-2xl tracking-tight text-foreground">
        <Link
          href={`/projects/${project.slug}`}
          className="transition-colors duration-300 hover:text-accent"
        >
          {project.title}
        </Link>
      </h2>

      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
        {project.description}
      </p>

      {project.links && project.links.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-4">
          {project.links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent transition-opacity hover:opacity-70"
              >
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
