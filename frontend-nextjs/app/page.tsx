"use client";

import { EmptyState } from "@/components/layout/empty-state";
import { ProjectList } from "@/components/project/project-list";
import { ProjTitle } from "@/components/ui/typography"; 
import { Container } from "@/components/ui/container";
import { useEffect, useState } from "react"; 

// type def for proj
import type { Project } from "@/lib/types"

// dashboard for showing proj list 
export default function Dashboard() {
  // proj state 
  const [projects, setProjects] = useState<Project[]>([]);

  // FIXME get proj from local storage (fix me don't extract data here)
  useEffect(() => { 
    const stored: Project[] = JSON.parse(localStorage.getItem("projects") ?? "[]");
    setProjects(stored);
  }, []);
  
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
