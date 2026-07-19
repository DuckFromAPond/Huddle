//TODO local storage CRUD 

// useContext for shared lib 
import { useContext } from "react";
import type { Project } from "./types";

// create the local storage 
function CreateProj({proj} : {proj : Project}) { 
    // add new 
}


// read from loc storage 
function ReadProj({projects} : {projects: Project[]}) { 
    // val check if exist 
    if (!projects) { 
        // localStorage.setItem()
    }
}