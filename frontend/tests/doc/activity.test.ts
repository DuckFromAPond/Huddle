import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { createCard, moveCard } from "@/lib/doc/cards"; // point at your real helpers
import { getActivity } from "@/lib/doc/activity";

const ada = { name: "Ada", color: "#82aae2" };
const kim = { name: "Kim", color: "#5dcaa5" };

describe("card activity", () => {
  it("logs created and status moves", () => {
    const doc = new Y.Doc();
    const id = createCard(doc, "Write docs", "todo", ada);
    moveCard(doc, id, "in_progress", ada);
    const card = doc.getMap<Y.Map<unknown>>("cards").get(id)!;
    expect(getActivity(card).map((e) => e.type).sort()).toEqual(["created", "status"]);
  });

  it("keeps both offline moves after merge", () => {
    const a = new Y.Doc();
    const id = createCard(a, "Write docs", "todo", ada);
    const b = new Y.Doc();
    Y.applyUpdate(b, Y.encodeStateAsUpdate(a));

    moveCard(a, id, "in_progress", ada);
    moveCard(b, id, "done", kim);
    Y.applyUpdate(a, Y.encodeStateAsUpdate(b));
    Y.applyUpdate(b, Y.encodeStateAsUpdate(a));

    const events = getActivity(a.getMap<Y.Map<unknown>>("cards").get(id)!);
    expect(events.filter((e) => e.type === "status")).toHaveLength(2);
  });

  it("caps the log at 100 events", () => {
    const doc = new Y.Doc();
    const id = createCard(doc, "Busy card", "todo", ada);
    for (let i = 0; i < 120; i++) moveCard(doc, id, i % 2 ? "todo" : "done", ada);
    const card = doc.getMap<Y.Map<unknown>>("cards").get(id)!;
    expect(getActivity(card)).toHaveLength(100);
  });
});