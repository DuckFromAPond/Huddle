//TODO local storage CRUD 
import type { Project } from "./types";

// get all project 
function getAllProjs() : Project[] { 
    return (JSON.parse(localStorage.getItem("projects") ?? "[]"));
}

// create the local storage 
function createProj(project:Project) : void { 
    // add new 
    const projects = getAllProjs(); 
    projects.push(project); 
    updateProj(projects); 
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

export {getAllProjs, createProj, getProjByID, deleteProj}; 