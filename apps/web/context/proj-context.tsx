// Shares the OPEN project (its Y.Doc) with every page under /projects/[id]

"use client"

import { createContext, useContext } from "react"
import type { OpenProject } from "@/lib/storage/projects"

const ProjectContext = createContext<OpenProject | null>(null);

export const ProjectProvider = ProjectContext.Provider;

// use to get shared project
export function useProject(): OpenProject {
  const project = useContext(ProjectContext);
  
  if (!project) { 
    throw new Error("useProject must be used inside ProjectProvider")
  }

  return project; 
}
