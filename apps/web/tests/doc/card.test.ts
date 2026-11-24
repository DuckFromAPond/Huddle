import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import {
  createCard,
  deleteCard,
  getCard,
  getCards,
  getDescription,
  moveCard,
  orderForIndex,
  setTitle,
  dropCard,
  cardsMap,
} from "@/lib/doc/cards";
import { ada, fork, sync } from "@/tests/helpers";
import { STATUSES, type Status } from "@/lib/schema";

/** Titles of one status's cards, in display order. */
function titles(doc: Y.Doc, status: Status): string[] {
  return getCards(doc, status).map((c) => c.title);
}

/** A doc with cards "A", "B", "C" in todo, in that order. Returns their ids. */
function threeCards() {
  const doc = new Y.Doc();
  const a = createCard(doc, { status: "todo", title: "A", order: "a0" }, ada);
  const b = createCard(doc, { status: "todo", title: "B", order: "a1" }, ada);
  const c = createCard(doc, { status: "todo", title: "C", order: "a2" }, ada);
  return { doc, a, b, c };
}

describe("createCard", () => {
  it("stores the title and status, with an empty description and an order key", () => {
    const doc = new Y.Doc();
    const id = createCard(doc, { status: "in-progress", title: "Draft" }, ada);

    const card = getCard(doc, id)!;
    expect(card.id).toBe(id);
    expect(card.title).toBe("Draft");
    expect(card.status).toBe("in-progress");
    expect(card.description).toBe("");
    expect(card.order.length).toBeGreaterThan(0);
  });

  it("gives every card a different id", () => {
    const doc = new Y.Doc();
    const ids = [1, 2, 3].map((n) => createCard(doc, { status: "todo", title: `Card ${n}` }, ada));
    expect(new Set(ids).size).toBe(3);
  });

  it("appends to the end of its status by default", () => {
    const doc = new Y.Doc();
    createCard(doc, { status: "todo", title: "first" }, ada);
    createCard(doc, { status: "todo", title: "second" }, ada);
    createCard(doc, { status: "todo", title: "third" }, ada);

    expect(titles(doc, "todo")).toEqual(["first", "second", "third"]);
    const orders = getCards(doc, "todo").map((c) => c.order);
    expect(orders[0]! < orders[1]!).toBe(true);
    expect(orders[1]! < orders[2]!).toBe(true);
  });

  it("uses an explicit order when one is given", () => {
    const doc = new Y.Doc();
    const id = createCard(doc, { status: "todo", title: "x", order: "a5" }, ada);
    expect(getCard(doc, id)!.order).toBe("a5");
  });
});

describe("getCards and getCard", () => {
  it("returns nothing for an empty doc", () => {
    expect(getCards(new Y.Doc())).toEqual([]);
  });

  it("sorts by order key, not by creation time", () => {
    const doc = new Y.Doc();
    createCard(doc, { status: "todo", title: "last", order: "a2" }, ada);
    createCard(doc, { status: "todo", title: "first", order: "a0" }, ada);
    createCard(doc, { status: "todo", title: "middle", order: "a1" }, ada);

    expect(titles(doc, "todo")).toEqual(["first", "middle", "last"]);
  });

  it("compares order keys as plain strings, so uppercase sorts before lowercase", () => {
    const doc = new Y.Doc();
    createCard(doc, { status: "todo", title: "lower", order: "a0" }, ada);
    createCard(doc, { status: "todo", title: "upper", order: "Zz" }, ada);

    // "Z" (code 90) comes before "a" (code 97). localeCompare would reverse this.
    expect(titles(doc, "todo")).toEqual(["upper", "lower"]);
  });

  it("filters by status", () => {
    const doc = new Y.Doc();
    createCard(doc, { status: "todo", title: "t" }, ada);
    createCard(doc, { status: "in-progress", title: "p" }, ada);
    createCard(doc, { status: "done", title: "d" }, ada);

    expect(titles(doc, "todo")).toEqual(["t"]);
    expect(titles(doc, "in-progress")).toEqual(["p"]);
    expect(titles(doc, "done")).toEqual(["d"]);
    expect(getCards(doc)).toHaveLength(3);
  });

  it("returns undefined for an unknown id", () => {
    expect(getCard(new Y.Doc(), "nope")).toBeUndefined();
  });

  it("falls back to todo if a card has a status this version does not know", () => {
    const doc = new Y.Doc();
    const id = createCard(doc, { status: "done", title: "odd" }, ada);
    (doc.getMap("cards").get(id) as Y.Map<unknown>).set("status", "archived");

    expect(getCard(doc, id)!.status).toBe("todo");
  });

  it("only ever contains the known statuses", () => {
    expect([...STATUSES]).toEqual(["todo", "in-progress", "done"]);
  });
});

describe("moveCard", () => {
  it("changes status and order together", () => {
    const doc = new Y.Doc();
    const id = createCard(doc, { status: "todo", title: "x", order: "a0" }, ada);

    expect(moveCard(doc, id, "done", "a7", ada)).toBe(true);

    const card = getCard(doc, id)!;
    expect(card.status).toBe("done");
    expect(card.order).toBe("a7");
    expect(getCards(doc, "todo")).toHaveLength(0);
  });

  it("emits one change for the whole move, not one per field", () => {
    const doc = new Y.Doc();
    const id = createCard(doc, { status: "todo", title: "x", order: "a0" }, ada);

    let updates = 0;
    doc.on("update", () => updates++);
    moveCard(doc, id, "done", "a1", ada);

    expect(updates).toBe(1);
  });

  it("reorders within the same status", () => {
    const { doc, a } = threeCards();
    moveCard(doc, a, "todo", "a3", ada); // A goes after C

    expect(titles(doc, "todo")).toEqual(["B", "C", "A"]);
  });

  it("returns false and changes nothing for an unknown id", () => {
    const doc = new Y.Doc();
    expect(moveCard(doc, "nope", "done", "a0", ada)).toBe(false);
    expect(getCards(doc)).toHaveLength(0);
  });
});

describe("setTitle and getDescription", () => {
  it("setTitle changes the title and returns false for an unknown id", () => {
    const doc = new Y.Doc();
    const id = createCard(doc, { status: "todo", title: "old" }, ada);

    expect(setTitle(doc, id, "new", ada)).toBe(true);
    expect(getCard(doc, id)!.title).toBe("new");
    expect(setTitle(doc, "nope", "x", ada)).toBe(false);
  });

  it("getDescription returns the live text, and edits show up on the card", () => {
    const doc = new Y.Doc();
    const id = createCard(doc, { status: "todo", title: "x" }, ada);

    getDescription(doc, id)!.insert(0, "some notes");
    expect(getCard(doc, id)!.description).toBe("some notes");
  });

  it("getDescription returns undefined for an unknown id", () => {
    expect(getDescription(new Y.Doc(), "nope")).toBeUndefined();
  });
});

describe("deleteCard", () => {
  it("removes the card and leaves the others alone", () => {
    const { doc, b } = threeCards();

    expect(deleteCard(doc, b)).toBe(true);
    expect(titles(doc, "todo")).toEqual(["A", "C"]);
    expect(getCard(doc, b)).toBeUndefined();
  });

  it("returns false when the card is already gone", () => {
    const { doc, a } = threeCards();
    deleteCard(doc, a);
    expect(deleteCard(doc, a)).toBe(false);
  });
});

describe("orderForIndex", () => {
  it("returns a usable key for an empty status", () => {
    const doc = new Y.Doc();
    const order = orderForIndex(doc, "todo", 0);
    expect(order.length).toBeGreaterThan(0);

    const id = createCard(doc, { status: "todo", title: "x", order }, ada);
    expect(getCard(doc, id)!.order).toBe(order);
  });

  it("index 0 sorts before the first card", () => {
    const { doc, a } = threeCards();
    const order = orderForIndex(doc, "todo", 0);
    expect(order < getCard(doc, a)!.order).toBe(true);
  });

  it("a middle index sorts strictly between its neighbours", () => {
    const { doc, a, b } = threeCards();
    const order = orderForIndex(doc, "todo", 1); // between A and B
    expect(order > getCard(doc, a)!.order).toBe(true);
    expect(order < getCard(doc, b)!.order).toBe(true);
  });

  it("the last index sorts after the last card", () => {
    const { doc, c } = threeCards();
    const order = orderForIndex(doc, "todo", 3);
    expect(order > getCard(doc, c)!.order).toBe(true);
  });

  it("clamps out-of-range indexes to the top or the end", () => {
    const { doc } = threeCards();
    expect(orderForIndex(doc, "todo", Infinity)).toBe(orderForIndex(doc, "todo", 3));
    expect(orderForIndex(doc, "todo", 99)).toBe(orderForIndex(doc, "todo", 3));
    expect(orderForIndex(doc, "todo", -5)).toBe(orderForIndex(doc, "todo", 0));
  });

  it("does not count the card being moved", () => {
    const { doc, a, b, c } = threeCards();

    // Without movingId, index 1 is between A and B.
    const plain = orderForIndex(doc, "todo", 1);
    expect(plain > getCard(doc, a)!.order && plain < getCard(doc, b)!.order).toBe(true);

    // With A as the moving card, the list is [B, C], so index 1 is between B and C.
    const moving = orderForIndex(doc, "todo", 1, a);
    expect(moving > getCard(doc, b)!.order && moving < getCard(doc, c)!.order).toBe(true);
  });

  it("only looks at cards in the requested status", () => {
    const onlyTodo = new Y.Doc();
    createCard(onlyTodo, { status: "todo", title: "x", order: "a0" }, ada);

    const withDone = new Y.Doc();
    createCard(withDone, { status: "todo", title: "x", order: "a0" }, ada);
    createCard(withDone, { status: "done", title: "d1", order: "a1" }, ada);
    createCard(withDone, { status: "done", title: "d2", order: "a2" }, ada);

    expect(orderForIndex(withDone, "todo", 1)).toBe(orderForIndex(onlyTodo, "todo", 1));
  });

  it("dropping at an index puts the card at that position", () => {
    const { doc, a, c } = threeCards();

    moveCard(doc, c, "todo", orderForIndex(doc, "todo", 0, c), ada); // C to the top
    expect(titles(doc, "todo")).toEqual(["C", "A", "B"]);

    moveCard(doc, a, "todo", orderForIndex(doc, "todo", 2, a), ada); // A to the end
    expect(titles(doc, "todo")).toEqual(["C", "B", "A"]);
  });

  it("works across statuses: dropping into another status uses that status's cards", () => {
    const { doc, a } = threeCards();
    const d1 = createCard(doc, { status: "done", title: "d1", order: "a0" }, ada);
    createCard(doc, { status: "done", title: "d2", order: "a1" }, ada);

    moveCard(doc, a, "done", orderForIndex(doc, "done", 1, a), ada); // between d1 and d2

    expect(titles(doc, "done")).toEqual(["d1", "A", "d2"]);
    expect(getCard(doc, d1)!.status).toBe("done");
    expect(titles(doc, "todo")).toEqual(["B", "C"]);
  });

  describe("when two cards share the same order key", () => {
    /** One shared card, then two peers each append a card with the same key. */
    function tiedColumn() {
      const a = new Y.Doc();
      createCard(a, { status: "todo", title: "first" }, ada);
      const b = fork(a);
      createCard(a, { status: "todo", title: "from A" }, ada);
      createCard(b, { status: "todo", title: "from B" }, ada);
      sync(a, b);
      return a;
    }

    it("the tie really exists in this setup", () => {
      const doc = tiedColumn();
      const [first, tie1, tie2] = getCards(doc, "todo");
      expect(first!.order < tie1!.order).toBe(true);
      expect(tie1!.order).toBe(tie2!.order);
    });

    it("does not throw when dropping between the tied cards", () => {
      const doc = tiedColumn();
      const tiedKey = getCards(doc, "todo")[1]!.order;

      const order = orderForIndex(doc, "todo", 2); // between the two tied cards
      expect(order > tiedKey).toBe(true); // lands after both: equal keys cannot be split
    });

    it("still works just above the tied cards and at the end", () => {
      const doc = tiedColumn();
      const [first, tie] = getCards(doc, "todo");

      const above = orderForIndex(doc, "todo", 1); // between first and the tied pair
      expect(above > first!.order && above < tie!.order).toBe(true);

      const end = orderForIndex(doc, "todo", 3);
      expect(end > tie!.order).toBe(true);
    });
  });
});

describe("bad order keys from a peer", () => {
  it.each([
    ["empty", ""],
    ["junk", "NOT A KEY"],
    ["number", 5],
  ])("orderForIndex and dropCard survive a %s key", (_label, bad) => {
    const { doc, a, b } = threeCards();
    cardsMap(doc).get(b)!.set("order", bad);
    expect(() => orderForIndex(doc, "todo", 1)).not.toThrow();
    expect(() => dropCard(doc, a, "todo", [b, a], ada)).not.toThrow();
  });
});
