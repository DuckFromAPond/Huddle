import { beforeEach, describe, expect, it } from "vitest";
import { getIdentity, parseIdentity, setIdentity, MAX_NAME_LENGTH } from "@/lib/identity";

beforeEach(() => localStorage.clear());

describe("identity", () => {
  it("creates a guest once and returns the same one after", () => {
    expect(getIdentity()).toEqual(getIdentity());
  });
  it("trims, caps and defaults the name", () => {
    setIdentity({ name: "   ", color: "#007190" });
    expect(getIdentity().name).toBe("Guest");
    setIdentity({ name: "x".repeat(50), color: "#007190" });
    expect(getIdentity().name).toHaveLength(MAX_NAME_LENGTH);
  });
  it("rejects malformed saved data", () => {
    expect(parseIdentity("{bad")).toBeNull();
    expect(parseIdentity(JSON.stringify({ name: 1, color: "#fff" }))).toBeNull();
  });
});
