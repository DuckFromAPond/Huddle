"use client";

// project page layout
import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getProjBySlug, markProjOpened } from "@/lib/projects";
import { ProjectProvider } from "@/context/proj-context";
import { ProjTitle } from "@/components/ui/typography";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/layout/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { useProjects } from "@/hooks/use-projects";

export default function ProjectLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { id } = useParams<{ id: string }>();
  // undefined = still loading, null = not found
  const projects = useProjects();

  // undefined = loading, null = not found, object = found
  const project = projects === null ? undefined : getProjBySlug(id, projects);

  const projectId = project?.id;
  useEffect(() => {
    if (projectId) markProjOpened(projectId);
  }, [projectId]);

  // TODO add a export button (export as JSON)

  // FIXME skeleton add here when loading details
  if (project === undefined) return <Container />;

  if (project === null) {
    return (
      <EmptyState
        title="Project not found"
        description="It may have been deleted, or it isn't saved in this browser."
        action={
          <Link href="/" className={buttonVariants()}>
            Back to projects
          </Link>
        }
      />
    );
  }

  return (
    <ProjectProvider value={project}>
      <Container className="grid grid-cols-2 gap-2">
        <ProjTitle>{project.name}</ProjTitle>
        {children}
      </Container>
    </ProjectProvider>
  );
}
