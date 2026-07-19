import type { Project } from "@/lib/types";
import { Container } from "@/components/ui/container";

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
        
    // FIXME remove static data 
    const projects: Project[] = [
        {
            "id": "1",
            "name": "TITLE",
            "desc": "PROJECT DESCRIPTION ",
        }
    ]; 

    const { id } = await params;
    // for when using actual data from loc 
    // const project = JSON.parse(localStorage.getItem(`project-${id}`) ?? "null");

    const project = projects.find((p) => p.id === id);
    
    return ( 
        <Container> 

        </Container>
    )
}