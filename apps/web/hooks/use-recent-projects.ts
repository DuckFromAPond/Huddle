"use client";
import { useProjectList } from "@/hooks/use-projects";

export function useRecentProjects(limit = 5) {
  const projects = useProjectList();
  return {
    loading: projects === null,
    recent: (projects ?? []).filter((p) => p.lastOpenedAt !== undefined).slice(0, limit),
  };
}
