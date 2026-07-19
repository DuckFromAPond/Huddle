import { Container } from "@/components/ui/container";

// blank state for when there is no project 
export function EmptyState({className, ...props}: React.ComponentProps<typeof Container> ) {
    return ( 
        <Container className={className} {...props}>
            <h1> No projects found </h1>
            <h3> You can add new projects by using "+ create"</h3>
        </Container>
    )
}