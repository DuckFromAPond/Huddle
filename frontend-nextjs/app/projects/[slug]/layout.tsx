"use client"

// project page layout
import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { getProjBySlug, markProjOpened } from "@/lib/projects"
import { ProjectProvider } from "@/context/proj-context"
import { ProjTitle } from "@/components/ui/typography"
import { Container } from "@/components/ui/container"
import { EmptyState } from "@/components/layout/empty-state"
import { buttonVariants } from "@/components/ui/button"
import type { Project } from "@/lib/types"

export default function ProjectLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { slug } = useParams<{ slug: string }>()
  // undefined = still loading, null = not found
  const [project, setProject] = useState<Project | null | undefined>(undefined)

  useEffect(() => {
    const found = getProjBySlug(slug)
    setProject(found ?? null)
    if (found) markProjOpened(found.id)
  }, [slug])

  // TODO add a export button (export as JSON)

  // FIXME skeleton add here when loading details
  if (project === undefined) return <Container />

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
    )
  }

  return (
    <ProjectProvider value={project}>
      <Container className="grid grid-cols-2 gap-2">
        <ProjTitle>{project.name}</ProjTitle>
        {children}
      </Container>
    </ProjectProvider>
  )
}