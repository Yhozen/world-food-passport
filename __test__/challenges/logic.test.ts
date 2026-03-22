// @vitest-environment node
import { describe, expect, test } from "vitest";

import { asianTopCuisinesChallenge } from "@/lib/challenges/catalog";
import {
  getCompletionThreshold,
  getNewUnlocks,
  isTargetCountry,
  normalizeCountryCode,
} from "@/lib/challenges/logic";

describe("challenge catalog", () => {
  test("includes required ui-facing fields", () => {
    expect(asianTopCuisinesChallenge.id).toBe("asian-top-cuisines");
    expect(asianTopCuisinesChallenge.title).toBeTruthy();
    expect(asianTopCuisinesChallenge.description).toBeTruthy();
  });
});

describe("challenge logic", () => {
  test("normalizes lowercase alpha-2 code to uppercase", () => {
    expect(normalizeCountryCode("jp")).toBe("JP");
  });

  test("normalizes whitespace and nullish inputs safely", () => {
    expect(normalizeCountryCode(" jp ")).toBe("JP");
    expect(normalizeCountryCode("   ")).toBe("");
    expect(normalizeCountryCode(null)).toBe("");
    expect(normalizeCountryCode(undefined)).toBe("");
  });

  test("checks target country using strict alpha-2 codes", () => {
    expect(isTargetCountry("JP")).toBe(true);
    expect(isTargetCountry(" jp ")).toBe(true);
    expect(isTargetCountry("JPN")).toBe(false);
    expect(isTargetCountry("US")).toBe(false);
  });

  test("derives completion threshold from target country count by default", () => {
    expect(
      getCompletionThreshold({
        targetCountryCodes: ["JP", "KR", "TH"],
        milestones: [1],
        id: "test",
        title: "Test",
        description: "Test",
        completionUnlockKey: "completion",
      }),
    ).toBe(3);
  });

  test("returns milestone unlock when crossing milestone threshold", () => {
    const newUnlocks = getNewUnlocks({
      previousCount: 2,
      nextCount: 3,
      alreadyUnlocked: [],
    });

    expect(newUnlocks).toContain("milestone_3");
  });

  test("returns all eligible unlocks when crossing multiple thresholds", () => {
    expect(
      getNewUnlocks({ previousCount: 0, nextCount: 5, alreadyUnlocked: [] }),
    ).toEqual(["milestone_1", "milestone_3", "milestone_5", "completion"]);
  });

  test("is idempotent when unlocks already exist", () => {
    expect(
      getNewUnlocks({
        previousCount: 0,
        nextCount: 5,
        alreadyUnlocked: ["milestone_1", "milestone_3", "milestone_5", "completion"],
      }),
    ).toEqual([]);
  });
});
