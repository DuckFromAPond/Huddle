"use client";

import { EmptyState } from "@/components/layout/empty-state";
import { ProjectList } from "@/components/project/project-list";
import { ProjTitle } from "@/components/ui/typography"; 
import { Container } from "@/components/ui/container";
import { ProjectListSkeleton } from "@/components/project/project-skeleton";
import { useEffect, useState } from "react"; 
import { getAllProjs } from "@/lib/projects";

// type def for proj
import type { Project } from "@/lib/types"

// dashboard for showing proj list 
export default function Dashboard() {
  // proj state 
  const [projects, setProjects] = useState<Project[] | null>(null);

  // get from storage 
  useEffect(() => { 
    setProjects(getAllProjs());
  }, []);

  if (projects === null) {
    return (
      <ProjectListSkeleton />
    );
  }

  return (
    <main>
      {projects.length === 0 ? (
        <EmptyState /> 
      ):(
        <Container className="p-6 pt-2">
          <ProjTitle className="text-2xl pb-4">Projects</ProjTitle>
          <ProjectList projects={projects} />
        </Container>
      )
      }
    </main> 
  )
} 
