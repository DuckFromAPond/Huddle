import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { initProject, isNewerThanApp, upgradeSchema } from "@/lib/doc/project";
import { SCHEMA_VERSION } from "@/lib/doc/schema";
import { fork, sync } from "@/tests/helpers";

const meta = (doc: Y.Doc) => doc.getMap("meta");

describe("schema version gate", () => {
  it("upgrades an older doc and leaves a current one alone", () => {
    const doc = new Y.Doc();
    initProject(doc, "x");
    meta(doc).set("schemaVersion", SCHEMA_VERSION - 1);
    upgradeSchema(doc);
    expect(meta(doc).get("schemaVersion")).toBe(SCHEMA_VERSION);

    let updates = 0;
    doc.on("update", () => updates++);
    upgradeSchema(doc); // already current
    expect(updates).toBe(0);
  });

  it("flags a doc touched by a newer app", () => {
    const doc = new Y.Doc();
    initProject(doc, "x");
    expect(isNewerThanApp(doc)).toBe(false);
    meta(doc).set("schemaVersion", SCHEMA_VERSION + 1);
    expect(isNewerThanApp(doc)).toBe(true);
  });

  it("two peers upgrading offline agree after sync", () => {
    const a = new Y.Doc();
    initProject(a, "x");
    meta(a).set("schemaVersion", SCHEMA_VERSION - 1);
    const b = fork(a);
    upgradeSchema(a);
    upgradeSchema(b);
    sync(a, b);
    expect(meta(a).get("schemaVersion")).toBe(SCHEMA_VERSION);
    expect(meta(b).get("schemaVersion")).toBe(SCHEMA_VERSION);
  });
});
