"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useOpenProject } from "@/hooks/use-open-project";
import { ProjectProvider, useProject } from "@/context/proj-context";
import { getProjectTitle } from "@/lib/doc/project";
import { Heading, Text } from "@/components/ui/typography";

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const state = useOpenProject(id);

  if (state.status === "loading") {
    return (
      <Text className="grid h-full place-items-center text-sm text-muted-foreground">
        Opening project…
      </Text>
    );
  }

  if (state.status !== "ready") {
    return (
      <div className="grid h-full place-content-center gap-3 text-center">
        <Heading as="h1" className="text-lg font-medium">
          {state.status === "not-found"
            ? "This project isn't on this device"
            : "Couldn't open this project"}
        </Heading>
        <Text className="text-sm text-muted-foreground">
          {state.status === "not-found"
            ? "It may have been deleted, or it was shared with you and sharing isn't set up yet."
            : "Your browser may be blocking storage, for example in a private window."}
        </Text>
        <Link href="/projects" className="text-sm underline underline-offset-4">
          Back to your projects
        </Link>
      </div>
    );
  }

  return (
    <ProjectProvider value={state.project}>
      <Board />
    </ProjectProvider>
  );
}

// placeholder: next session replaces this with columns, cards and dragging
function Board() {
  const { doc } = useProject();
  return (
    <div className="p-6">
      <Heading as="h1" className="text-xl font-medium">
        {getProjectTitle(doc) ?? "Untitled"}
      </Heading>
    </div>
  );
}
