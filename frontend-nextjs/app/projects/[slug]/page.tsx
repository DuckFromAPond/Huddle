// redirect to default summary page
import { redirect } from "next/navigation"

// default project page is the summary page for that project
export default async function ProjectPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    console.log(slug)
    redirect(`/projects/${slug}/summary`)
}