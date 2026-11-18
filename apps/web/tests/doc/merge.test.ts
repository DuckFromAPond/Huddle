import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import {
  createCard,
  deleteCard,
  getCard,
  getCards,
  getDescription,
  moveCard,
  setTitle,
} from "@/lib/doc/cards";
import { fork, snapshot, sync } from "@/tests/helpers";

/** Two users that start from the same history. */
function twoPeers() {
  const a = new Y.Doc();
  const id = createCard(a, { status: "todo", title: "Write tests" });
  const b = fork(a);
  return { a, b, id };
}

describe("concurrent moves", () => {
  it("converge, and status + order always come from the same move", () => {
    const { a, b, id } = twoPeers();

    moveCard(a, id, "in-progress", "a0");
    moveCard(b, id, "done", "a1");
    sync(a, b);

    expect(snapshot(a)).toEqual(snapshot(b));
    expect(getCards(a)).toHaveLength(1);

    const { status, order } = getCard(a, id)!;
    const fromA = status === "in-progress" && order === "a0";
    const fromB = status === "done" && order === "a1";
    expect(fromA || fromB).toBe(true); // never a mix of the two
  });
});

describe("delete versus edit", () => {
  it("delete wins: edits to a deleted card do not bring it back", () => {
    const { a, b, id } = twoPeers();

    deleteCard(a, id);
    setTitle(b, id, "Edited while the other peer deleted it");
    getDescription(b, id)!.insert(0, "more edits");
    sync(a, b);

    expect(getCards(a)).toHaveLength(0);
    expect(getCards(b)).toHaveLength(0);
  });
});

describe("offline create", () => {
  it("keeps both cards, no duplicates, same order on both peers", () => {
    const { a, b } = twoPeers();

    createCard(a, { status: "todo", title: "From A, offline" });
    createCard(b, { status: "todo", title: "From B, offline" });
    sync(a, b);

    expect(getCards(a)).toHaveLength(3);
    expect(snapshot(a)).toEqual(snapshot(b));
    const ids = getCards(a).map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("sorts cards the same way even when two peers pick the same order key", () => {
    const { a, b } = twoPeers();

    // Both append to the end of the same column, so both pick the same key.
    createCard(a, { status: "todo", title: "A" });
    createCard(b, { status: "todo", title: "B" });
    const keys = [...getCards(a), ...getCards(b)].map((c) => c.order);
    sync(a, b);

    expect(new Set(keys).size).toBeLessThan(keys.length); // a tie really happened
    expect(getCards(a, "todo").map((c) => c.id)).toEqual(getCards(b, "todo").map((c) => c.id));
  });
});

describe("rejoin with a stale copy", () => {
  it("a returning peer cannot resurrect a deleted card", () => {
    const { a, b, id } = twoPeers();

    deleteCard(a, id); // b is offline and still has the card
    expect(getCards(b)).toHaveLength(1);

    sync(a, b); // b comes back
    expect(getCards(a)).toHaveLength(0);
    expect(getCards(b)).toHaveLength(0);
  });

  it("holds even when the room's memory was lost and the stale peer joins first", () => {
    const { a, b, id } = twoPeers();
    deleteCard(a, id);

    const freshRoom = new Y.Doc(); // relay restarted with nothing in memory
    sync(freshRoom, b); // stale peer pushes its old state first
    expect(getCards(freshRoom)).toHaveLength(1);

    sync(freshRoom, a); // the user that deleted it joins afterwards
    sync(freshRoom, b);

    expect(getCards(freshRoom)).toHaveLength(0);
    expect(getCards(a)).toHaveLength(0);
    expect(getCards(b)).toHaveLength(0);
  });
});

describe("two people typing in one description", () => {
  it("merges both inserts and converges", () => {
    const { a, b, id } = twoPeers();

    getDescription(a, id)!.insert(0, "Hello ");
    getDescription(b, id)!.insert(0, "World");
    sync(a, b);

    const textA = getDescription(a, id)!.toString();
    const textB = getDescription(b, id)!.toString();
    expect(textA).toBe(textB);
    expect(textA).toContain("Hello ");
    expect(textA).toContain("World");
    expect(textA).toHaveLength("Hello World".length);
  });
});
