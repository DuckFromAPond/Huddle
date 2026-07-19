// redir to default summary page 
import { redirect } from "next/navigation";

// default project page is the summary page for that proj 
export default async function ProjectPage({
    params
} : {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    redirect(`/projects/${id}/summary`);
}