"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { ProjectList } from "@/components/project/project-list";
import { ProjectListSkeleton } from "@/components/project/project-skeleton";
import { Title } from "@/components/ui/typography";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";

import { createProject, importProject, type OpenProject } from "@/lib/storage/projects";
import { ImportError } from "@/lib/doc/project";
import { useProjectList } from "@/hooks/use-projects";
import { getIdentity } from "@/lib/identity";
import { projectPath } from "@/lib/routes";
import { requestPersistentStorage } from "@/lib/storage/persist";

export default function ProjectsPage() {
  const router = useRouter();
  const projects = useProjectList(); // null = not loaded yet
  const fileInput = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState<"create" | "import" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // close the copy of the proj, then let the board page open its own
  async function openOnBoard(project: OpenProject) {
    const id = project.id;
    await project.close();
    router.push(projectPath(id));
  }

  // create a new proj
  async function handleCreate() {
    void requestPersistentStorage();

    setError(null);
    setBusy("create");
    try {
      // open board and create project
      await openOnBoard(await createProject("Untitled project"));
    } catch {
      setError("Couldn't create the project. Try again.");
      setBusy(null);
    }
  }

  // file change (import)
  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    void requestPersistentStorage();

    const file = event.target.files?.[0];
    event.target.value = ""; // lets the same file be picked again
    if (!file) return;

    setError(null);
    setBusy("import");
    try {
      // open board and import project (passing the identity for activity log)
      await openOnBoard(await importProject(await file.text(), getIdentity()));
    } catch (err) {
      setError(
        err instanceof ImportError ? err.message : "Couldn't import that file. Try another.",
      );
      setBusy(null);
    }
  }

  // additional children to empty state component
  const actions = (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        {/* import btn */}
        <Button
          variant="secondary"
          onClick={() => fileInput.current?.click()}
          disabled={busy !== null}
        >
          <Upload className="size-4" /> {busy === "import" ? "Importing…" : "Import"}
        </Button>

        {/* create btn */}
        <Button variant="default" onClick={handleCreate} disabled={busy !== null}>
          <Plus className="size-4" /> {busy === "create" ? "Creating…" : "New project"}
        </Button>
      </div>

      {error && <Text className="text-sm text-destructive">{error}</Text>}

      {/* input for import */}
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );

  // loading state
  if (projects === null) {
    return <ProjectListSkeleton />;
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        title="Start your first project"
        description="Boards live on this device. Share a link to collaborate."
        action={actions}
      />
    );
  }

  return (
    <Container className="p-6 pt-4">
      <div className="flex items-start justify-between pb-4">
        <Title>Projects</Title>
        {actions}
      </div>
      <ProjectList projects={projects} />
    </Container>
  );
}
