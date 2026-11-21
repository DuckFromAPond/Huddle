"use client";

import { useEffect, useState } from "react";
import { deleteProject, openProject, type OpenProject } from "@/lib/storage/projects";

export type OpenProjectState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error" }
  | { status: "ready"; project: OpenProject };

const LOADING: OpenProjectState = { status: "loading" };

/**
 * The ONLY place that opens a project for the UI.
 * Waits for IndexedDB, then reports loading -> ready | not-found | error,
 * and always closes the project when the id changes or the component unmounts.
 */
export function useOpenProject(id: string): OpenProjectState {
  // the result remembers which id it belongs to, so a new id reads as "loading"
  // without calling setState synchronously inside the effect
  const [result, setResult] = useState<{ id: string; state: OpenProjectState } | null>(null);

  useEffect(() => {
    let cancelled = false; // strict mode runs effects twice; the first run must not win
    let project: OpenProject | undefined;

    openProject(id)
      .then(async (opened) => {
        if (cancelled) {
          await opened.close();
          return;
        }

        if (!opened.existedLocally) {
          // no local copy: close and remove the empty database openProject just created.
          // (When the relay exists, a joiner waits for the first sync here instead.)
          await opened.close();
          await deleteProject(id);
          if (!cancelled) setResult({ id, state: { status: "not-found" } });
          return;
        }

        project = opened;
        setResult({ id, state: { status: "ready", project: opened } });
      })
      .catch(() => {
        // e.g. IndexedDB blocked (some private-browsing modes)
        if (!cancelled) setResult({ id, state: { status: "error" } });
      });

    return () => {
      cancelled = true;
      void project?.close();
    };
  }, [id]);

  return result?.id === id ? result.state : LOADING;
}
