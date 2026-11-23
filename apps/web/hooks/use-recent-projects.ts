"use client";

import { useProjectList } from "@/hooks/use-projects";
import { sortRecent } from "@/lib/storage/project-index";

export function useRecentProjects(limit = 5) {
  const projects = useProjectList();
  return {
    loading: projects === null,
    recent: sortRecent(projects ?? [], limit),
  };
}
