import { describe, expect, it } from "vitest";
import { sortRecent } from "@/lib/storage/project-index";

describe("sortRecent", () => {
  it("orders recents by last opened, not last edited", () => {
    const list = [
      { id: "a", title: "A", updatedAt: 9, lastOpenedAt: 1 },
      { id: "b", title: "B", updatedAt: 1, lastOpenedAt: 9 },
    ];
    expect(sortRecent(list, 5).map((p) => p.id)).toEqual(["b", "a"]);
  });

  it("leaves out projects that were never opened, and respects the limit", () => {
    const list = [
      { id: "a", title: "A", updatedAt: 1 },
      { id: "b", title: "B", updatedAt: 1, lastOpenedAt: 2 },
      { id: "c", title: "C", updatedAt: 1, lastOpenedAt: 3 },
    ];
    expect(sortRecent(list, 1).map((p) => p.id)).toEqual(["c"]);
  });
});
