"use client"

// import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { EmptyState } from "@/components/layout/empty-state"
import { ProjectList } from "@/components/project/project-list"
import { ProjTitle } from "@/components/ui/typography"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ProjectListSkeleton } from "@/components/project/project-skeleton"
import { createProj, projectPath } from "@/lib/projects"
// import type { Project } from "@/lib/types"
import { useProjects } from "@/hooks/use-projects"

// dashboard for showing proj list
export default function Dashboard() {
  const router = useRouter()
  const projects = useProjects() // null = not loaded yet

  function handleCreate() {
    const newProj = createProj("Untitled project")
    router.push(`${projectPath(newProj)}/summary`)
  }

  if (projects === null) {
    return <ProjectListSkeleton />
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Create your first project to get started."
        action={<Button onClick={handleCreate}>New project</Button>}
      />
    )
  }

  return (
    <Container className="p-6 pt-2">
      <ProjTitle className="text-2xl pb-4">Projects</ProjTitle>
      <ProjectList projects={projects} />
    </Container>
  )
}