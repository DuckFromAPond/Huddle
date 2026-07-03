import { EmptyState } from "@/components/layout/empty-state";
import { ProjectList } from "@/components/project/project-list";
import type { Project } from "@/lib/types"

export default function Dashboard() {

  const projects: Project[] = [
    {
      "id": "1",
      "name": "TITLE",
    }
  ]; 

  return (
    <main>
      {projects.length === 0 ? (
        <EmptyState /> 
      ):(
        <ProjectList projects={projects} />
      )
      }
    </main> 
  )
} 
