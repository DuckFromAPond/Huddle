"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useOpenProject } from "@/hooks/use-open-project";
import { ProjectProvider } from "@/context/proj-context";
import { Board } from "@/components/board/board";
import { Heading, Muted } from "@/components/ui/typography";
import { Loader2 } from "lucide-react";
import { BoardTopbar } from "@/components/board/board-topbar";

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const state = useOpenProject(id);

  if (state.status === "loading") {
    return (
      <div
        role="status"
        className="grid min-h-svh place-items-center animate-in fade-in duration-300 delay-300 fill-mode-both"
      >
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          <p className="text-base">Opening project…</p>
        </div>
      </div>
    );
  }

  if (state.status !== "ready") {
    return (
      <div className="grid h-full place-content-center gap-3 text-center">
        <Heading as="h1">
          {state.status === "not-found"
            ? "This project isn't on this device"
            : "Couldn't open this project"}
        </Heading>
        <Muted>
          {state.status === "not-found"
            ? "It may have been deleted, or it was shared with you and sharing isn't set up yet."
            : "Your browser may be blocking storage, for example in a private window."}
        </Muted>
        <Link href="/projects" className="text-sm underline underline-offset-4">
          Back to your projects
        </Link>
      </div>
    );
  }

  return (
    <ProjectProvider value={state.project}>
      <div className="flex h-svh flex-col">
        <BoardTopbar />
        <Board />
        {/* <BoardDock />  */}
      </div>
    </ProjectProvider>
  );
}
