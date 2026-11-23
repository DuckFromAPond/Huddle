"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useOpenProject } from "@/hooks/use-open-project";
import { ProjectProvider, useCanEdit, useProject } from "@/context/proj-context";
import { OutdatedBanner } from "@/components/project/outdated-banner";
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

function Board() {
  const { doc } = useProject();
  const canEdit = useCanEdit();

  return (
    <div className="flex flex-col gap-4 p-6">
      {!canEdit && <OutdatedBanner />}
      <Heading as="h1" className="text-xl font-medium">
        {getProjectTitle(doc) ?? "Untitled"}
      </Heading>
      {/* TODO columns go here; each one calls useCanEdit() itself */}
    </div>
  );
}
