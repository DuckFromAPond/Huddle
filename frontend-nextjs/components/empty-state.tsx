import { Container } from "@/components/ui/container";

export function EmptyState() {
    return ( 
        <Container>
            <h1> No projects found </h1>
            <h3> You can add new projects by using "+ create"</h3>
        </Container>
    )
}