// @vitest-environment node
import { randomUUID } from "node:crypto";
import { describe, expect, test, vi } from "vitest";

import { asianTopCuisinesChallenge } from "@/lib/challenges/catalog";
import {
  onAchievementUnlocked,
  onChallengeStarted,
  resetChallengeMetricsListeners,
} from "@/lib/challenges/metrics";
import {
  applyRestaurantCreateToChallenges,
  getChallengeSummaryForUser,
} from "@/lib/challenges/service";
import { prisma } from "@/lib/prisma";

function buildRestaurantData(input: {
  userId: string;
  countryCode: string;
  countryName?: string;
  createdAt: Date;
}) {
  return {
    userId: input.userId,
    name: `Restaurant-${randomUUID()}`,
    countryCode: input.countryCode,
    countryName: input.countryName ?? input.countryCode,
    cuisineTags: [],
    createdAt: input.createdAt,
  };
}

async function cleanupUserData(userId: string) {
  await prisma.challengeAchievementUnlock.deleteMany({ where: { userId } });
  await prisma.challengeProgress.deleteMany({ where: { userId } });
  await prisma.challengeRepairJob.deleteMany({ where: { userId } });
  await prisma.restaurant.deleteMany({ where: { userId } });
}

describe("challenge service", () => {
  test("qualifying new country increments once", async () => {
    const userId = randomUUID();
    const createdAt = new Date();

    try {
      await applyRestaurantCreateToChallenges({
        userId,
        countryCode: "JPN",
        createdAt,
      });

      await applyRestaurantCreateToChallenges({
        userId,
        countryCode: "JPN",
        createdAt: new Date(createdAt.getTime() + 1000),
      });

      const progress = await prisma.challengeProgress.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId: asianTopCuisinesChallenge.id,
          },
        },
      });

      expect(progress?.uniqueTargetCount).toBe(1);
      expect(progress?.unlockedCountryCodes).toEqual(["JPN"]);
    } finally {
      await cleanupUserData(userId);
    }
  });

  test("page-visit enrollment counts only restaurants createdAt > enrolledAt", async () => {
    const userId = randomUUID();
    const oldRestaurantCreatedAt = new Date("2020-01-01T00:00:00.000Z");

    try {
      await prisma.restaurant.create({
        data: buildRestaurantData({
          userId,
          countryCode: "JPN",
          createdAt: oldRestaurantCreatedAt,
        }),
      });

      const enrolledSummary = await getChallengeSummaryForUser(userId);
      const enrolled = enrolledSummary.find(
        (item) => item.challengeId === asianTopCuisinesChallenge.id,
      );

      expect(enrolled?.enrolledAt).toBeTruthy();
      expect(enrolled?.uniqueTargetCount).toBe(0);

      const createAfterEnrollmentAt = new Date((enrolled?.enrolledAt ?? new Date()).getTime() + 1);
      await applyRestaurantCreateToChallenges({
        userId,
        countryCode: "KOR",
        createdAt: createAfterEnrollmentAt,
      });

      const summary = await getChallengeSummaryForUser(userId);
      const challenge = summary.find((item) => item.challengeId === asianTopCuisinesChallenge.id);

      expect(challenge?.uniqueTargetCount).toBe(1);
      expect(challenge?.unlockedCountryCodes).toEqual(["KOR"]);
    } finally {
      await cleanupUserData(userId);
    }
  });

  test("page-visit enrollment does not count when createdAt <= enrolledAt", async () => {
    const userId = randomUUID();
    const oldRestaurantCreatedAt = new Date("2020-01-01T00:00:00.000Z");

    try {
      await prisma.restaurant.create({
        data: buildRestaurantData({
          userId,
          countryCode: "JPN",
          createdAt: oldRestaurantCreatedAt,
        }),
      });

      const enrolledSummary = await getChallengeSummaryForUser(userId);
      const enrolled = enrolledSummary.find(
        (item) => item.challengeId === asianTopCuisinesChallenge.id,
      );

      expect(enrolled?.enrolledAt).toBeTruthy();

      const result = await applyRestaurantCreateToChallenges({
        userId,
        countryCode: "KOR",
        createdAt: enrolled?.enrolledAt ?? new Date(),
      });

      const summary = await getChallengeSummaryForUser(userId);
      const challenge = summary.find((item) => item.challengeId === asianTopCuisinesChallenge.id);

      expect(result.didIncrement).toBe(false);
      expect(challenge?.uniqueTargetCount).toBe(0);
      expect(challenge?.unlockedCountryCodes).toEqual([]);
    } finally {
      await cleanupUserData(userId);
    }
  });

  test("page-enrolled flow stays strict even after prior increments", async () => {
    const userId = randomUUID();
    const oldRestaurantCreatedAt = new Date("2020-01-01T00:00:00.000Z");

    try {
      await prisma.restaurant.create({
        data: buildRestaurantData({
          userId,
          countryCode: "JPN",
          createdAt: oldRestaurantCreatedAt,
        }),
      });

      const enrolledSummary = await getChallengeSummaryForUser(userId);
      const enrolled = enrolledSummary.find(
        (item) => item.challengeId === asianTopCuisinesChallenge.id,
      );

      const enrolledAt = enrolled?.enrolledAt ?? new Date();

      await applyRestaurantCreateToChallenges({
        userId,
        countryCode: "KOR",
        createdAt: new Date(enrolledAt.getTime() + 1),
      });

      const result = await applyRestaurantCreateToChallenges({
        userId,
        countryCode: "THA",
        createdAt: enrolledAt,
      });

      const summary = await getChallengeSummaryForUser(userId);
      const challenge = summary.find((item) => item.challengeId === asianTopCuisinesChallenge.id);

      expect(result.didIncrement).toBe(false);
      expect(challenge?.uniqueTargetCount).toBe(1);
      expect(challenge?.unlockedCountryCodes).toEqual(["KOR"]);
    } finally {
      await cleanupUserData(userId);
    }
  });

  test("first-touch qualifying create counts within same request", async () => {
    const userId = randomUUID();
    const createdAt = new Date();

    try {
      await applyRestaurantCreateToChallenges({
        userId,
        countryCode: "THA",
        createdAt,
      });

      const summary = await getChallengeSummaryForUser(userId);
      const challenge = summary.find((item) => item.challengeId === asianTopCuisinesChallenge.id);

      expect(challenge?.uniqueTargetCount).toBe(1);
      expect(challenge?.unlockedCountryCodes).toEqual(["THA"]);
    } finally {
      await cleanupUserData(userId);
    }
  });

  test("concurrent qualifying creates unlock only once", async () => {
    const userId = randomUUID();
    const createdAt = new Date("2100-01-01T00:00:00.000Z");
    const laterCreatedAt = new Date(createdAt.getTime() + 1);

    try {
      await Promise.all([
        applyRestaurantCreateToChallenges({
          userId,
          countryCode: "JPN",
          createdAt,
        }),
        applyRestaurantCreateToChallenges({
          userId,
          countryCode: "KOR",
          createdAt: laterCreatedAt,
        }),
      ]);

      const unlocks = await prisma.challengeAchievementUnlock.findMany({
        where: {
          userId,
          challengeId: asianTopCuisinesChallenge.id,
          achievementKey: "milestone_1",
        },
      });

      const progress = await prisma.challengeProgress.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId: asianTopCuisinesChallenge.id,
          },
        },
      });

      expect(unlocks).toHaveLength(1);
      expect(progress?.uniqueTargetCount).toBe(2);
      expect(new Set(progress?.unlockedCountryCodes ?? [])).toEqual(new Set(["JPN", "KOR"]));
    } finally {
      await cleanupUserData(userId);
    }
  });

  test("concurrent same-country creates stay idempotent", async () => {
    const userId = randomUUID();
    const createdAt = new Date();

    try {
      await Promise.all([
        applyRestaurantCreateToChallenges({
          userId,
          countryCode: "JPN",
          createdAt,
        }),
        applyRestaurantCreateToChallenges({
          userId,
          countryCode: "JPN",
          createdAt: new Date(createdAt.getTime() + 1),
        }),
      ]);

      const progress = await prisma.challengeProgress.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId: asianTopCuisinesChallenge.id,
          },
        },
      });

      const unlocks = await prisma.challengeAchievementUnlock.findMany({
        where: {
          userId,
          challengeId: asianTopCuisinesChallenge.id,
          achievementKey: "milestone_1",
        },
      });

      expect(progress?.uniqueTargetCount).toBe(1);
      expect(progress?.unlockedCountryCodes).toEqual(["JPN"]);
      expect(unlocks).toHaveLength(1);
    } finally {
      await cleanupUserData(userId);
    }
  });

  test("delete path does not decrement", async () => {
    const userId = randomUUID();
    const createdAt = new Date();

    try {
      const restaurant = await prisma.restaurant.create({
        data: buildRestaurantData({
          userId,
          countryCode: "IND",
          createdAt,
        }),
      });

      await applyRestaurantCreateToChallenges({
        userId,
        countryCode: "IND",
        createdAt,
      });

      await prisma.restaurant.delete({ where: { id: restaurant.id } });

      const summary = await getChallengeSummaryForUser(userId);
      const challenge = summary.find((item) => item.challengeId === asianTopCuisinesChallenge.id);

      expect(challenge?.uniqueTargetCount).toBe(1);
      expect(challenge?.unlockedCountryCodes).toEqual(["IND"]);
    } finally {
      await cleanupUserData(userId);
    }
  });

  test("challenge-write failure does not fail primary restaurant path contract", async () => {
    const userId = randomUUID();
    const createdAt = new Date();

    const transactionSpy = vi
      .spyOn(prisma, "$transaction")
      .mockRejectedValueOnce(new Error("challenge-write-broken"));

    try {
      const result = await applyRestaurantCreateToChallenges({
        userId,
        countryCode: "JPN",
        createdAt,
      });

      expect(result.warningCode).toBe("challenge_write_failed");
      expect(result.repairJobQueued).toBe(true);
    } finally {
      transactionSpy.mockRestore();
      await cleanupUserData(userId);
    }
  });

  test("enrollment emits challenge_started", async () => {
    const userId = randomUUID();
    const createdAt = new Date();
    const events: Array<{ userId: string; challengeId: string }> = [];

    resetChallengeMetricsListeners();
    const unsubscribe = onChallengeStarted((event) => {
      events.push({ userId: event.userId, challengeId: event.challengeId });
    });

    try {
      await applyRestaurantCreateToChallenges({
        userId,
        countryCode: "JPN",
        createdAt,
      });

      await applyRestaurantCreateToChallenges({
        userId,
        countryCode: "KOR",
        createdAt: new Date(createdAt.getTime() + 1),
      });

      expect(events).toEqual([
        {
          userId,
          challengeId: asianTopCuisinesChallenge.id,
        },
      ]);
    } finally {
      unsubscribe();
      resetChallengeMetricsListeners();
      await cleanupUserData(userId);
    }
  });

  test("unlock emits achievement_unlocked", async () => {
    const userId = randomUUID();
    const createdAt = new Date();
    const events: Array<{ achievementKey: string; challengeId: string; userId: string }> = [];

    resetChallengeMetricsListeners();
    const unsubscribe = onAchievementUnlocked((event) => {
      events.push({
        userId: event.userId,
        challengeId: event.challengeId,
        achievementKey: event.achievementKey,
      });
    });

    try {
      await applyRestaurantCreateToChallenges({
        userId,
        countryCode: "JPN",
        createdAt,
      });

      const secondCreatedAt = new Date(Date.now() + 1000);
      const thirdCreatedAt = new Date(Date.now() + 2000);
      const duplicateCreatedAt = new Date(Date.now() + 3000);

      await applyRestaurantCreateToChallenges({
        userId,
        countryCode: "KOR",
        createdAt: secondCreatedAt,
      });

      await applyRestaurantCreateToChallenges({
        userId,
        countryCode: "THA",
        createdAt: thirdCreatedAt,
      });

      await applyRestaurantCreateToChallenges({
        userId,
        countryCode: "KOR",
        createdAt: duplicateCreatedAt,
      });

      expect(events).toEqual([
        {
          userId,
          challengeId: asianTopCuisinesChallenge.id,
          achievementKey: "milestone_1",
        },
        {
          userId,
          challengeId: asianTopCuisinesChallenge.id,
          achievementKey: "milestone_3",
        },
      ]);
    } finally {
      unsubscribe();
      resetChallengeMetricsListeners();
      await cleanupUserData(userId);
    }
  });

  test("metric listener throw does not fail challenge write path", async () => {
    const userId = randomUUID();
    const createdAt = new Date();

    resetChallengeMetricsListeners();
    const unsubscribeStarted = onChallengeStarted(() => {
      throw new Error("metric-started-failed");
    });
    const unsubscribeUnlocked = onAchievementUnlocked(() => {
      throw new Error("metric-unlocked-failed");
    });

    try {
      const result = await applyRestaurantCreateToChallenges({
        userId,
        countryCode: "JPN",
        createdAt,
      });

      const progress = await prisma.challengeProgress.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId: asianTopCuisinesChallenge.id,
          },
        },
      });

      expect(result.warningCode).toBeNull();
      expect(result.repairJobQueued).toBe(false);
      expect(result.didIncrement).toBe(true);
      expect(progress?.uniqueTargetCount).toBe(1);
      expect(progress?.unlockedCountryCodes).toEqual(["JPN"]);
    } finally {
      unsubscribeStarted();
      unsubscribeUnlocked();
      resetChallengeMetricsListeners();
      await cleanupUserData(userId);
    }
  });

  test("challenge failure enqueues repair job", async () => {
    const userId = randomUUID();
    const createdAt = new Date();

    const transactionSpy = vi
      .spyOn(prisma, "$transaction")
      .mockRejectedValueOnce(new Error("challenge-write-broken"));

    try {
      await applyRestaurantCreateToChallenges({
        userId,
        countryCode: "JPN",
        createdAt,
      });

      const jobs = await prisma.challengeRepairJob.findMany({
        where: {
          userId,
          challengeId: asianTopCuisinesChallenge.id,
          reason: "challenge_write_failed",
        },
      });

      expect(jobs).toHaveLength(1);
      expect(jobs[0]?.status).toBe("queued");
    } finally {
      transactionSpy.mockRestore();
      await cleanupUserData(userId);
    }
  });
});
