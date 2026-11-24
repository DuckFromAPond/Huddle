// Shares the OPEN project (its Y.Doc) with every page under /projects/[id]

"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import { isNewerThanApp } from "@/lib/doc/project";
import type { OpenProject } from "@/lib/storage/projects";

const ProjectContext = createContext<OpenProject | null>(null);

export const ProjectProvider = ProjectContext.Provider;

// use to get shared project
export function useProject(): OpenProject {
  const project = useContext(ProjectContext);

  if (!project) {
    throw new Error("useProject must be used inside ProjectProvider");
  }

  return project;
}

/** False when this app must not write to the open project (a newer Huddle has updated it). */
export function useCanEdit(): boolean {
  const { doc } = useProject();

  const subscribe = useCallback(
    (cb: () => void) => {
      const meta = doc.getMap("meta");
      const versions = doc.getMap("versions");
      meta.observe(cb);
      versions.observe(cb);

      return () => {
        meta.unobserve(cb);
        versions.unobserve(cb);
      };
    },
    [doc],
  );

  return useSyncExternalStore(
    subscribe,
    () => !isNewerThanApp(doc),
    () => false,
  );
}
