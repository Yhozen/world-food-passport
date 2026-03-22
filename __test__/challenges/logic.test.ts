/** @vitest-environment node */

import { describe, expect, test } from "vitest";

import {
  CHALLENGE_ACHIEVEMENT_KEYS,
  asianTopCuisinesChallenge,
} from "@/lib/challenges/catalog";
import {
  getNewUnlocks,
  isTargetCountry,
  normalizeCountryCode,
} from "@/lib/challenges/logic";

describe("challenge catalog", () => {
  test("defines the v1 asian top cuisines challenge", () => {
    expect(asianTopCuisinesChallenge.id).toBe("asian-top-cuisines");
    expect(asianTopCuisinesChallenge.targetCountries).toEqual([
      "CN",
      "JP",
      "KR",
      "TH",
      "IN",
    ]);
    expect(asianTopCuisinesChallenge.milestones).toEqual([1, 3, 5]);
    expect(CHALLENGE_ACHIEVEMENT_KEYS).toEqual([
      "milestone_1",
      "milestone_3",
      "milestone_5",
      "completion",
    ]);
  });
});

describe("challenge logic", () => {
  test("normalizeCountryCode trims and uppercases", () => {
    expect(normalizeCountryCode(" jp ")).toBe("JP");
  });

  test("normalizeCountryCode returns empty string for nullish and blank values", () => {
    expect(normalizeCountryCode(null)).toBe("");
    expect(normalizeCountryCode(undefined)).toBe("");
    expect(normalizeCountryCode("   ")).toBe("");
  });

  test("isTargetCountry matches only normalized configured iso alpha-2 targets", () => {
    expect(isTargetCountry("jp")).toBe(true);
    expect(isTargetCountry(" JP ")).toBe(true);
    expect(isTargetCountry("us")).toBe(false);
    expect(isTargetCountry("jpn")).toBe(false);
    expect(isTargetCountry("")).toBe(false);
  });

  test("getNewUnlocks returns only newly crossed milestones and completion", () => {
    expect(
      getNewUnlocks({ previousCount: 2, nextCount: 3, alreadyUnlocked: [] }),
    ).toEqual(["milestone_3"]);

    expect(
      getNewUnlocks({ previousCount: 4, nextCount: 5, alreadyUnlocked: [] }),
    ).toEqual(["milestone_5", "completion"]);
  });

  test("getNewUnlocks never repeats already unlocked keys", () => {
    expect(
      getNewUnlocks({
        previousCount: 4,
        nextCount: 5,
        alreadyUnlocked: ["milestone_5"],
      }),
    ).toEqual(["completion"]);

    expect(
      getNewUnlocks({
        previousCount: 0,
        nextCount: 5,
        alreadyUnlocked: [
          "milestone_1",
          "milestone_3",
          "milestone_5",
          "completion",
        ],
      }),
    ).toEqual([]);
  });
});
