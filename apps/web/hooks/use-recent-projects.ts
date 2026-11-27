"use client";

import { useProjectList } from "@/hooks/use-project-list";
import { sortRecent } from "@/lib/storage/project-index";
import { useMemo } from "react";

/** get a list of recently viewed project, re-render on new changes */
export function useRecentProjects(limit = 5) {
  const projects = useProjectList();
  const recent = useMemo(() => sortRecent(projects ?? [], limit), [projects, limit]);
  return { loading: projects === null, recent };
}
