import Link from "next/link";
import { STATUSES, type Status } from "@/lib/doc/schema";
import type { ProjectSummary } from "@/lib/storage/project-index";
import { Heading, Text } from "@/components/ui/typography";

const MAX_BARS = 5;
const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

function editedAgo(ms: number): string {
  const minutes = Math.round((ms - Date.now()) / 60_000);
  if (minutes > -1) return "just now";
  if (minutes > -60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours > -24) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}

/** Tiny board drawn from counts: one column per status, one bar per card (capped). Decorative. */
function ColumnPreview({ counts }: { counts?: Partial<Record<Status, number>> }) {
  return (
    <svg
      viewBox="0 0 120 64"
      aria-hidden="true"
      className="block aspect-[15/8] w-full rounded-md bg-muted/40"
    >
      {STATUSES.map((status, col) => {
        const x = 6 + col * 37;
        const bars = Math.min(counts?.[status] ?? 0, MAX_BARS);
        return (
          <g key={status}>
            <rect x={x} y={6} width={34} height={52} rx={4} className="fill-muted" />
            {Array.from({ length: bars }, (_, i) => (
              <rect
                key={i}
                x={x + 3}
                y={10 + i * 9.5}
                width={28}
                height={7}
                rx={2}
                className={status === "done" ? "fill-primary/50" : "fill-background"}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const counts = project.counts;
  const total = counts ? STATUSES.reduce((n, s) => n + (counts[s] ?? 0), 0) : undefined;

  const meta = [
    total !== undefined && `${total} ${total === 1 ? "card" : "cards"}`,
    total ? `${counts?.done ?? 0} done` : null,
    `edited ${editedAgo(project.updatedAt)}`,
  ].filter(Boolean);

  return (
    // stretched-link card: the heading link's ::after covers the card, so future
    // actions (star, archive menu) can sit above it as separate buttons
    <article
      className="@container relative grid gap-3 rounded-xl border bg-card p-3
             transition-[border-color,box-shadow,translate] duration-150 ease-out
             has-[a:hover]:-translate-y-0.5 has-[a:hover]:border-input has-[a:hover]:shadow-md
             has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring
             motion-reduce:transition-none motion-reduce:has-[a:hover]:translate-y-0"
    >
      <ColumnPreview counts={counts} />
      <Heading as="h3" className="line-clamp-1">
        <Link
          href={`/projects/${project.id}`}
          className="outline-none after:absolute after:inset-0 after:content-['']"
        >
          {project.title}
        </Link>
      </Heading>
      <Text className="text-sm text-muted-foreground">{meta.join(" · ")}</Text>
    </article>
  );
}
