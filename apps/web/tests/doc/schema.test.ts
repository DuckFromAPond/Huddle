import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { initProject, isNewerThanApp, upgradeSchema, isInitialized } from "@/lib/doc/project";
import { SCHEMA_VERSION } from "@/lib/schema";
import { fork, sync } from "@/tests/helpers";

const meta = (doc: Y.Doc) => doc.getMap("meta");

/** A project as older versions of the app stored it: meta only, no versions map. */
function oldDoc(version = SCHEMA_VERSION - 1): Y.Doc {
  const doc = new Y.Doc();
  doc.transact(() => {
    meta(doc).set("title", "x");
    meta(doc).set("schemaVersion", version);
  });
  return doc;
}

describe("schema version gate", () => {
  it("upgrades an older doc and leaves a current one alone", () => {
    const doc = oldDoc();
    upgradeSchema(doc);
    expect(meta(doc).get("schemaVersion")).toBe(SCHEMA_VERSION);
    expect(doc.getMap("versions").has(String(SCHEMA_VERSION))).toBe(true);

    let updates = 0;
    doc.on("update", () => updates++);
    upgradeSchema(doc); // already current
    expect(updates).toBe(0);
  });

  it("two peers upgrading offline agree after sync", () => {
    const a = oldDoc();
    const b = fork(a);
    upgradeSchema(a);
    upgradeSchema(b);
    sync(a, b);

    for (const doc of [a, b]) {
      expect(meta(doc).get("schemaVersion")).toBe(SCHEMA_VERSION);
      expect(isNewerThanApp(doc)).toBe(false);
    }
  });

  it("flags a doc touched by a newer app", () => {
    const doc = new Y.Doc();
    initProject(doc, "x");
    expect(isNewerThanApp(doc)).toBe(false);
    meta(doc).set("schemaVersion", SCHEMA_VERSION + 1);
    expect(isNewerThanApp(doc)).toBe(true);
  });

  it("two different app versions upgrading offline merge to the higher one", () => {
    const a = new Y.Doc();
    initProject(a, "x");
    const b = fork(a);

    // simulate a v3 app on A and a v2 app on B, both offline
    a.getMap("versions").set(String(SCHEMA_VERSION + 2), true);
    b.getMap("versions").set(String(SCHEMA_VERSION + 1), true);
    sync(a, b);

    // both keys survive, so the highest wins on both peers
    expect(isNewerThanApp(a)).toBe(true);
    expect(isNewerThanApp(b)).toBe(true);
    expect([...a.getMap("versions").keys()].sort()).toEqual(
      [...b.getMap("versions").keys()].sort(),
    );
  });

  it("still reads projects that only have the old single version", () => {
    const doc = new Y.Doc();
    doc.getMap("meta").set("schemaVersion", SCHEMA_VERSION);
    expect(isInitialized(doc)).toBe(true);
    expect(isNewerThanApp(doc)).toBe(false);
  });

  it("ignores junk versions from a peer", () => {
    const doc = new Y.Doc();
    doc.getMap("meta").set("schemaVersion", NaN);
    doc.getMap("versions").set("Infinity", true);
    expect(isInitialized(doc)).toBe(false);
  });

  it("a new project records its version in both places", () => {
    const doc = new Y.Doc();
    initProject(doc, "x");
    expect(doc.getMap("versions").has(String(SCHEMA_VERSION))).toBe(true);
    expect(doc.getMap("meta").get("schemaVersion")).toBe(SCHEMA_VERSION);
  });
});
