import { describe, expect, test } from "vitest";

import {
  getNewUnlocks,
  isTargetCountry,
  normalizeCountryCode,
} from "@/lib/challenges/logic";

describe("challenge logic", () => {
  test("normalizes country code to uppercase", () => {
    expect(normalizeCountryCode("jp")).toBe("JP");
  });

  test("checks target country using strict alpha-2 codes", () => {
    expect(isTargetCountry("JP")).toBe(true);
    expect(isTargetCountry("US")).toBe(false);
  });

  test("returns milestone unlock when crossing milestone threshold", () => {
    const newUnlocks = getNewUnlocks({
      previousCount: 2,
      nextCount: 3,
      alreadyUnlocked: [],
    });

    expect(newUnlocks).toContain("milestone_3");
  });
});
