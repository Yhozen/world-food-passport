// @vitest-environment node
import { randomUUID } from "node:crypto";
import { describe, expect, test, vi } from "vitest";

import { asianTopCuisinesChallenge } from "@/lib/challenges/catalog";
import { getChallengeSummaryForUser } from "@/lib/challenges/service";
import { type Context } from "@/trpc/init";
import { challengesRouter } from "@/trpc/routers/challenges";

vi.mock("@/lib/challenges/service", () => ({
  getChallengeSummaryForUser: vi.fn(),
}));

function createContext(userId: string): Context {
  return { user: { id: userId } } as Context;
}

describe("challenges router", () => {
  test("getV1Summary returns challenge metadata with progress", async () => {
    const userId = randomUUID();
    const enrolledAt = new Date("2026-01-01T00:00:00.000Z");
    const caller = challengesRouter.createCaller(createContext(userId));

    const getChallengeSummaryForUserMock = getChallengeSummaryForUser as unknown as ReturnType<
      typeof vi.fn
    >;

    getChallengeSummaryForUserMock.mockResolvedValueOnce([
      {
        challengeId: asianTopCuisinesChallenge.id,
        enrolledAt,
        uniqueTargetCount: 2,
        unlockedCountryCodes: ["JP", "KR"],
        unlockedAchievements: ["milestone_1"],
      },
    ]);

    const result = await caller.getV1Summary();

    expect(result).toEqual([
      {
        challengeId: asianTopCuisinesChallenge.id,
        title: asianTopCuisinesChallenge.title,
        description: asianTopCuisinesChallenge.description,
        targetCountryCodes: [...asianTopCuisinesChallenge.targetCountryCodes],
        milestones: [...asianTopCuisinesChallenge.milestones],
        completionThreshold: asianTopCuisinesChallenge.completionThreshold,
        completionUnlockKey: asianTopCuisinesChallenge.completionUnlockKey,
        enrolledAt,
        uniqueTargetCount: 2,
        unlockedCountryCodes: ["JP", "KR"],
        unlockedAchievements: ["milestone_1"],
      },
    ]);
    expect(getChallengeSummaryForUser).toHaveBeenCalledWith(userId);
  });
});
