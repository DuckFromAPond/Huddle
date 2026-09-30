//TODO local storage CRUD 
import type { Project } from "./types";

// get all project 
function getAllProjs() : Project[] { 
    return (JSON.parse(localStorage.getItem("projects") ?? "[]"));
}

// create the local storage 
function createProj(name: string, desc: string = "") : Project { 
    // dummy proj 
    const project: Project = {
        id: crypto.randomUUID(),
        name,
        desc,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastOpenedAt: Date.now(),
        board: {
            schemaVersion: 1,
            columns: [
                { id: crypto.randomUUID(), title: "Todo", cards: [] },
                { id: crypto.randomUUID(), title: "In Progress", cards: [] },
                { id: crypto.randomUUID(), title: "Done", cards: [] },
            ],
        },
    }

    // add new 
    const projects = getAllProjs(); 
    projects.push(project); 
    updateProj(projects); 
    return project;
}

// update project (for adding, deleting & changing projects)
function updateProj(project: Project[]): void { 
    localStorage.setItem("projects", JSON.stringify(project)); 
}

function deleteProj(id: string) : void { 
    // get all proj except the giving proj 
    const projects = getAllProjs().filter((proj) => proj.id != id); 
    updateProj(projects)
}


function getProjByID(id:string): Project | null { 
    return getAllProjs().find((proj) => proj.id === id) ?? null;
}

// mark a project as opened (updates lastOpenedAt for recency sorting)
function markProjOpened(id: string): void {
    const projects = getAllProjs();
    const updated = projects.map((proj) =>
        proj.id === id ? { ...proj, lastOpenedAt: Date.now() } : proj
    );
    updateProj(updated);
}

// get the most recently opened projects
function getRecentProjs(limit = 5): Project[] {
    return getAllProjs()
        .filter((proj) => proj.lastOpenedAt !== undefined)
        .sort((a, b) => (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0))
        .slice(0, limit);
}

// slugify to use for url instead using id for url
function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "untitled"
}

function projectPath(proj: Project): string {
  return `/projects/${slugify(proj.name)}-${proj.id.slice(0, 8)}`
}

// resolve from the URL segment: match on the id suffix, ignore the slug
function getProjBySlug(
  slug: string,
  projects: Project[] = getAllProjs()
): Project | null {
  const shortId = slug.slice(-8)
  return projects.find((p) => p.id.startsWith(shortId)) ?? null
}


export { getAllProjs, createProj, getProjByID, deleteProj, markProjOpened, getRecentProjs, projectPath, getProjBySlug };