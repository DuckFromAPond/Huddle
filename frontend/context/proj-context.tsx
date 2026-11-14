// LOGIC for EDITING

"use client"

import { createContext, useContext } from "react"
import type { Project } from "@/lib/types"

const ProjectContext = createContext<Project | null>(null)

export const ProjectProvider = ProjectContext.Provider

export function useProject(): Project {
  const project = useContext(ProjectContext)
  if (!project) throw new Error("useProject must be used inside ProjectProvider")
  return project
}