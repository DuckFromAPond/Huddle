import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { getActivity } from "@/lib/doc/activity";
import { cardsMap, createCard, moveCard, setTitle } from "@/lib/doc/cards";
import { ada, fork, kim, sync } from "@/tests/helpers";

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

  it("getActivity lists the latest local event first", () => {
    const doc = new Y.Doc();
    const id = createCard(doc, { status: "todo", title: "a" }, ada);
    setTitle(doc, id, "b", ada);
    expect(getActivity(cardsMap(doc).get(id)!)[0]!.type).toBe("renamed");
  });

  it("records which peer did what", () => {
    const a = new Y.Doc();
    const id = createCard(a, { status: "todo", title: "x" }, ada);
    const b = fork(a);
    moveCard(b, id, "done", "a1", kim);
    sync(a, b);
    const [latest] = getActivity(cardsMap(a).get(id)!);
    expect(latest!.by).toMatchObject({ id: kim.id, name: "Kim", clientId: b.clientID });
  });

  it("a merge can hold up to 100 events per offline peer, and the next event trims it back", () => {
    const a = new Y.Doc();
    const id = createCard(a, { status: "todo", title: "x" }, ada);
    const b = fork(a);
    for (let i = 0; i < 120; i++) {
      moveCard(a, id, i % 2 ? "todo" : "done", "a0", ada);
      moveCard(b, id, i % 2 ? "in-progress" : "done", "a0", kim);
    }
    sync(a, b);

    // each peer could only trim its own events, so both sets of 100 survive
    expect(getActivity(cardsMap(a).get(id)!)).toHaveLength(200);

    // the next event on either peer trims back to the cap, and that syncs too
    setTitle(a, id, "trim me", ada);
    sync(a, b);
    expect(getActivity(cardsMap(a).get(id)!)).toHaveLength(100);
    expect(getActivity(cardsMap(b).get(id)!)).toHaveLength(100);
  });
});
