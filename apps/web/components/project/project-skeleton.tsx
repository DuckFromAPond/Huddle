import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { PROJECT_GRID } from "./project-list";

/** Same layout as the projects page, so nothing shifts when the list arrives. */
export function ProjectListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Container className="p-6 pt-4" aria-busy="true" aria-label="Loading projects">
      {/* header: title + Import / New project */}
      <div className="flex items-start justify-between pb-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      {/* same grid and card shape as ProjectList / ProjectCard */}
      <ul className={PROJECT_GRID}>
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="grid gap-3 rounded-xl border bg-card p-3">
            <Skeleton className="aspect-[15/8] w-full rounded-md" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </li>
        ))}
      </ul>
    </Container>
  );
}
