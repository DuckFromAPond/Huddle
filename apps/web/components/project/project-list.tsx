import type { ProjectSummary } from "@/lib/storage/project-index";
import { ProjectCard } from "@/components/project/project-card";

// styling for grid
export const PROJECT_GRID = "grid grid-cols-[repeat(auto-fill,16rem)] justify-start gap-4";

export function ProjectList({ projects }: { projects: ProjectSummary[] }) {
  return (
    <ul className={PROJECT_GRID}>
      {projects.map((project) => (
        <li key={project.id}>
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
}
