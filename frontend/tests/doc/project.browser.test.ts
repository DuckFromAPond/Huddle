// TODO READ 

import { beforeEach, describe, expect, it } from "vitest";
import {
    createCard,
    getCards,
    getDescription,
    orderForIndex,
    STATUSES,
} from "@/lib/doc/cards";
import {
    exportProject,
    ImportError,
    isInitialized,
    setProjectTitle,
} from "@/lib/doc/project";
import {
    getProjectSummary,
    listProjects,
    listRecentProjects,
    removeProject,
    upsertProject,
} from "@/lib/storage/project-index";
import {
    createProject,
    deleteProject,
    importProject,
    openProject,
} from "@/lib/storage/projects";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const fast = { indexDebounceMs: 0 };

beforeEach(() => {
    localStorage.clear()
});

describe("persistence", () => {
    it("keeps cards and the title after closing and reopening", async () => {
        const created = await createProject("My board", fast);
        createCard(created.doc, { status: "todo", title: "Persist me" });
        createCard(created.doc, { status: "done", title: "Already done" });
        await created.close();

        const reopened = await openProject(created.id, fast);
        expect(reopened.existedLocally).toBe(true);
        expect(getCards(reopened.doc).map((c) => c.title).sort()).toEqual([
            "Already done",
            "Persist me",
        ]);
        await reopened.close();
    });

    it("keeps description text", async () => {
        const created = await createProject("Notes", fast);
        const id = createCard(created.doc, { status: "todo", title: "x" });
        getDescription(created.doc, id)!.insert(0, "remember this");
        await created.close();

        const reopened = await openProject(created.id, fast);
        expect(getCards(reopened.doc)[0]!.description).toBe("remember this");
        await reopened.close();
    });

    it("opens an unknown id as an empty doc and does not list or invent anything", async () => {
        const project = await openProject("never-created", fast);

        expect(project.existedLocally).toBe(false);
        expect(isInitialized(project.doc)).toBe(false);
        expect(getCards(project.doc)).toHaveLength(0);

        await project.close();
        expect(listProjects()).toHaveLength(0);
    });
});

describe("dashboard index", () => {
    it("lists a new project with its title", async () => {
        const project = await createProject("Sprint notes", fast);
        expect(listProjects().map((p) => p.title)).toEqual(["Sprint notes"]);
        await project.close();
    });

    it("follows a title change", async () => {
        const project = await createProject("Old name", fast);
        setProjectTitle(project.doc, "New name");
        await project.close(); // close flushes the pending index write

        expect(getProjectSummary(project.id)!.title).toBe("New name");
    });

    it("bumps updatedAt on an edit, but not when a project is merely opened", async () => {
        const created = await createProject("Board", fast);
        await created.close();
        const t1 = getProjectSummary(created.id)!.updatedAt;

        await wait(20);
        const viewed = await openProject(created.id, fast); // loads from disk, no edits
        await viewed.close();
        expect(getProjectSummary(created.id)!.updatedAt).toBe(t1);

        await wait(20);
        const edited = await openProject(created.id, fast);
        createCard(edited.doc, { status: "todo", title: "a change" });
        await edited.close();
        expect(getProjectSummary(created.id)!.updatedAt).toBeGreaterThan(t1);
    });

    it("rebuilds a missing index entry when the project is opened", async () => {
        const created = await createProject("Survivor", fast);
        await created.close();
        removeProject(created.id); // e.g. the user cleared localStorage only
        expect(listProjects()).toHaveLength(0);

        const reopened = await openProject(created.id, fast);
        expect(listProjects().map((p) => p.title)).toEqual(["Survivor"]);
        await reopened.close();
    });

    it("tracks recently opened projects, and edits do not erase that", async () => {
        const a = await createProject("A", fast);
        await a.close();
        await wait(5);
        const b = await createProject("B", fast);
        await b.close();
        await wait(5);

        const again = await openProject(a.id, fast); // opening A makes it the most recent
        createCard(again.doc, { status: "todo", title: "an edit" });
        await again.close(); // the edit rewrites the index entry

        expect(listRecentProjects().map((p) => p.title)).toEqual(["A", "B"]);
        expect(getProjectSummary(a.id)!.lastOpenedAt).toBeDefined();
    });

    it("lists the most recently changed project first", () => {
        upsertProject({ id: "a", title: "old", updatedAt: 1 });
        upsertProject({ id: "b", title: "new", updatedAt: 2 });
        expect(listProjects().map((p) => p.id)).toEqual(["b", "a"]);
    });

    it("treats a corrupt index as empty instead of crashing", () => {
        localStorage.setItem("huddle:projects", "{not json");
        expect(listProjects()).toEqual([]);

        localStorage.setItem("huddle:projects", JSON.stringify([{ id: 1 }, "x"]));
        expect(listProjects()).toEqual([]);
    });

    it("replaces an entry with the same id and removes only the named one", () => {
        upsertProject({ id: "a", title: "first", updatedAt: 1 });
        upsertProject({ id: "a", title: "second", updatedAt: 2 });
        upsertProject({ id: "b", title: "other", updatedAt: 3 });
        expect(getProjectSummary("a")!.title).toBe("second");

        removeProject("a");
        expect(listProjects().map((p) => p.id)).toEqual(["b"]);
    });
});

describe("delete", () => {
    it("removes the project from the index and from IndexedDB", async () => {
        const created = await createProject("Doomed", fast);
        createCard(created.doc, { status: "todo", title: "gone soon" });
        await created.close();

        await deleteProject(created.id);
        expect(listProjects()).toHaveLength(0);

        const reopened = await openProject(created.id, fast);
        expect(reopened.existedLocally).toBe(false);
        expect(getCards(reopened.doc)).toHaveLength(0);
        await reopened.close();
    });
});

describe("export and import", () => {
    async function sampleProject() {
        const project = await createProject("Original", fast);
        createCard(project.doc, { status: "todo", title: "one" });
        createCard(project.doc, { status: "todo", title: "two" });
        const id = createCard(project.doc, { status: "done", title: "three" });
        getDescription(project.doc, id)!.insert(0, "details");
        return project;
    }

    it("round-trips into a NEW project and leaves the original untouched", async () => {
        const original = await sampleProject();
        const exported = JSON.stringify(exportProject(original.doc));

        const copy = await importProject(exported, fast);

        expect(copy.id).not.toBe(original.id);
        // Compare per status: across statuses the order depends on random card ids.
        const shape = (doc: typeof copy.doc) =>
        STATUSES.map((status) =>
            getCards(doc, status).map(({ title, description }) => ({ title, description })),
        );
        expect(shape(copy.doc)).toEqual(shape(original.doc));
        expect(getCards(original.doc)).toHaveLength(3);
        expect(listProjects()).toHaveLength(2);

        await copy.close();
        await original.close();
    });

    it("keeps the card order within each status", async () => {
        const original = await sampleProject();
        const copy = await importProject(exportProject(original.doc), fast);

        expect(getCards(copy.doc, "todo").map((c) => c.title)).toEqual(["one", "two"]);

        await copy.close();
        await original.close();
    });

    it("rejects bad files and creates nothing", async () => {
        const bad: unknown[] = [
            "{not json",
            "null",
            JSON.stringify({ app: "something-else", schemaVersion: 1, cards: [] }),
            JSON.stringify({ app: "huddle", schemaVersion: 999, cards: [] }),
            JSON.stringify({ app: "huddle", schemaVersion: 1 }),
        ];

        for (const input of bad) {
            await expect(importProject(input, fast)).rejects.toBeInstanceOf(ImportError);
        }
        expect(listProjects()).toHaveLength(0);
    });

    it("cleans up odd fields, and never trusts the order keys from a file", async () => {
        const file = {
            app: "huddle",
            schemaVersion: 1,
            title: "   ",
            cards: [
                { title: "ok", status: "todo", order: "NOT A VALID KEY" },
                { title: 42, status: "archived", description: 7, order: 5 },
                "garbage",
            ],
        };
        const project = await importProject(file, fast);

        const cards = getCards(project.doc);
        expect(cards).toHaveLength(3);
        expect(cards.every((c) => c.status === "todo")).toBe(true); // unknown status falls back
        expect(listProjects()[0]!.title).toBe("Imported project"); // blank title replaced

        // The real test of "never trust the keys": later ordering still works.
        expect(() => orderForIndex(project.doc, "todo", 1)).not.toThrow();
        expect(() => createCard(project.doc, { status: "todo", title: "later" })).not.toThrow();
        await project.close();
    });
});