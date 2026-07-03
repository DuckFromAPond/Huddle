import { Container } from "@/components/ui/container";
import { ProjTitle } from "@/components/ui/typography";

export function ProjectGrid({className,...props}: React.ComponentProps<typeof Container> ) {
    return ( 
        <Container className={className} {...props}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <ProjTitle />
                </div>
            </div>
        </Container>
    )
}