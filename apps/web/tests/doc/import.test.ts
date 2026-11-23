import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { applyImport, exportProject, parseImport } from "@/lib/doc/project";
import { createCard, getCards, orderForIndex, setPriority } from "@/lib/doc/cards";
import { ada } from "@/tests/helpers";

describe("export round-trip", () => {
  it("keeps priority", () => {
    const src = new Y.Doc();
    const id = createCard(src, { status: "todo", title: "x" }, ada);
    setPriority(src, id, "urgent", ada);

    const copy = new Y.Doc();
    applyImport(copy, parseImport(JSON.parse(JSON.stringify(exportProject(src)))), ada);
    expect(getCards(copy)[0]!.priority).toBe("urgent");
  });

  it("rebuilds order keys instead of trusting the file", () => {
    const doc = new Y.Doc();
    applyImport(
      doc,
      parseImport({
        app: "huddle",
        schemaVersion: 1,
        cards: [{ title: "a", order: "NOT A VALID KEY" }, { title: "b" }],
      }),
      ada,
    );
    expect(getCards(doc, "todo").map((c) => c.order)).not.toContain("NOT A VALID KEY");
    expect(() => orderForIndex(doc, "todo", 1)).not.toThrow();
  });

  it("drops unknown priorities to none", () => {
    const data = parseImport({
      app: "huddle",
      schemaVersion: 1,
      cards: [{ title: "a", priority: "lol" }],
    });
    expect(data.cards[0]).toMatchObject({ priority: "none" });
  });
});
