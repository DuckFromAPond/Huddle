"use client"

// project page layout 
import { ProjTitle } from "@/components/ui/typography";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Project } from "@/lib/types";
import { Container } from "@/components/ui/container";


export default function ProjectLayout({
  children,
}: Readonly<{
  children: React.ReactNode,
}>) {
  const {id} = useParams<{id:string}>(); 
  const [project, setProject] = useState<Project | null>(null);
  
  // FIXME get proj from local storage (fix me don't extract data here) <-------------- use context here 
  useEffect(() => { 
    const projects: Project[] = JSON.parse(localStorage.getItem("projects") ?? "[]");
    const foundProj = projects.find((p) => p.id === id);
    setProject(foundProj ?? null);
  }, [id]);  

  // TODO add a export button (export as JSON)

  // FIXME skeleton add here when loading details 

  return (
    <Container className="grid grid-cols-2 gap-2"> 
      <ProjTitle>{project?.name}</ProjTitle>
      {children}
    </Container>
  );
}
