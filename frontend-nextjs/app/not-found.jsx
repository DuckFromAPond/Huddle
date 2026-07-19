import { Container } from "@/components/ui/container";
import { Title, Text } from "@/components/ui/typography"

// TODO not found page + error page to be done 
export default function NotFound() { 
    return ( 
        <Container className="flex m-auto flex-col pt-36 items-center justify-center gap-2">
            <Title className="text-2xl font-semibold">404: Project not found</Title>
            <Text className="text-muted-foreground">This project doesn't exist or the link is broken.</Text>
        </Container>
    )
}