import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { createCard, moveCard } from "@/lib/doc/cards";
import { getActivity } from "@/lib/doc/activity";
import { ada, kim } from "@/tests/helpers";

describe("card activity", () => {
  it("logs created and status moves", () => {
    const doc = new Y.Doc();
    const id = createCard(doc, { status: "todo", title: "Write docs" }, ada);
    moveCard(doc, id, "in-progress", "a0", ada);
    const card = doc.getMap<Y.Map<unknown>>("cards").get(id)!;
    expect(
      getActivity(card)
        .map((e) => e.type)
        .sort(),
    ).toEqual(["created", "status"]);
  });

  it("keeps both offline moves after merge", () => {
    const a = new Y.Doc();
    const id = createCard(a, { status: "todo", title: "Write docs" }, ada);
    const b = new Y.Doc();
    Y.applyUpdate(b, Y.encodeStateAsUpdate(a));

    moveCard(a, id, "in-progress", "a0", ada);
    moveCard(b, id, "done", "a1", kim);
    Y.applyUpdate(a, Y.encodeStateAsUpdate(b));
    Y.applyUpdate(b, Y.encodeStateAsUpdate(a));

    const events = getActivity(a.getMap<Y.Map<unknown>>("cards").get(id)!);
    expect(events.filter((e) => e.type === "status")).toHaveLength(2);
  });

  it("caps the log at 100 events", () => {
    const doc = new Y.Doc();
    const id = createCard(doc, { status: "todo", title: "Busy card" }, ada);
    for (let i = 0; i < 120; i++) moveCard(doc, id, i % 2 ? "todo" : "done", "a0", ada);
    const card = doc.getMap<Y.Map<unknown>>("cards").get(id)!;
    expect(getActivity(card)).toHaveLength(100);
  });
});
