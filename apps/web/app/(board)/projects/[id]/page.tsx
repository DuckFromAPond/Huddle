"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useOpenProject } from "@/hooks/use-open-project";
import { ProjectProvider } from "@/context/proj-context";
import { Board } from "@/components/board/board";
import { Heading, Muted } from "@/components/ui/typography";
import { Loader2 } from "lucide-react";
import { BoardTopbar } from "@/components/board/board-topbar";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/hooks/use-preferences";

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const state = useOpenProject(id);
  const prefs = usePreferences();

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
    const notFound = state.status === "not-found";

    return (
      <main className="grid min-h-svh place-content-center justify-items-center gap-3 p-6 text-center">
        <Heading as="h1">
          {notFound ? "This project isn't on this device" : "Couldn't open this project"}
        </Heading>
        <Muted>
          {notFound
            ? "It may have been deleted, or it was shared with you and sharing isn't set up yet."
            : "Your browser may be blocking storage, for example in a private window."}
        </Muted>

        <div className="flex gap-2 pt-4">
          {!notFound && <Button onClick={() => location.reload()}>Try again</Button>}
          <Link
            href="/projects"
            className={buttonVariants({ variant: notFound ? "default" : "secondary" })}
          >
            Back to your projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <ProjectProvider value={state.project}>
      <div
        className={cn(
          "flex h-svh flex-col",
          prefs.dotBackground &&
            "bg-[radial-gradient(var(--color-border)_1px,transparent_0)] bg-size-[18px_18px]",
        )}
      >
        <BoardTopbar />
        <Board />
      </div>
    </ProjectProvider>
  );
}
