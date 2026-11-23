import { beforeEach, describe, expect, it } from "vitest";
import { getIdentity, parseIdentity, setIdentity, MAX_NAME_LENGTH } from "@/lib/identity";

beforeEach(() => localStorage.clear());

describe("identity", () => {
  it("creates a guest once and returns the same one after", () => {
    expect(getIdentity()).toEqual(getIdentity());
  });
  it("trims, caps and defaults the name, and keeps the id", () => {
    const me = getIdentity();
    setIdentity({ ...me, name: "   " });
    expect(getIdentity()).toMatchObject({ id: me.id, name: "Guest" });
    setIdentity({ ...me, name: "x".repeat(50) });
    expect(getIdentity().name).toHaveLength(MAX_NAME_LENGTH);
  });

  it("gives a new guest a stable id", () => {
    const first = getIdentity();
    expect(first.id).not.toBe("");
    expect(getIdentity().id).toBe(first.id);
  });

  it("treats an old saved identity without an id as no identity", () => {
    localStorage.setItem("huddle:identity", JSON.stringify({ name: "Kim", color: "#007190" }));
    const me = getIdentity();
    expect(me.id).not.toBe("");
    expect(me.name).not.toBe("Kim"); // a fresh guest
  });

  it("only lets plain hex colours through", () => {
    const raw = JSON.stringify({ id: "x", name: "a", color: "url(https://evil)" });
    expect(parseIdentity(raw)!.color).toBe("#547076");
  });
  it("rejects malformed saved data", () => {
    expect(parseIdentity("{bad")).toBeNull();
    expect(parseIdentity(JSON.stringify({ name: 1, color: "#fff" }))).toBeNull();
  });
});
