import { describe, expect, it } from "vitest";
import { parseHistory, serializeHistory } from "../client/src/lib/history";

describe("session history helpers", () => {
  it("serializes at most twelve entries and restores them", () => {
    const items = Array.from({ length: 14 }, (_, index) => ({ id: index }));
    const restored = parseHistory<{ id: number }>(serializeHistory(items));
    expect(restored).toHaveLength(12);
    expect(restored[0]?.id).toBe(0);
    expect(restored[11]?.id).toBe(11);
  });

  it("returns an empty history for malformed storage data", () => {
    expect(parseHistory("not-json")).toEqual([]);
    expect(parseHistory(JSON.stringify({ id: 1 }))).toEqual([]);
  });
});
