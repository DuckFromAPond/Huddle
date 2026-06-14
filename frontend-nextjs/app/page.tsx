import { EmptyState } from "@/components/empty-state";
import { Container } from "@/components/ui/container";

export default function Dashboard() {
  const project = []; 

  return (
    <main>
      <Container>
      {project.length === 0 ? (
       <EmptyState/> 
      ):(
        <div></div>
      )
      }       
      </Container>
    </main> 
  )
} 
