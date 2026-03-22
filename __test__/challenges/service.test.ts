// @vitest-environment node
import { randomUUID } from "node:crypto";
import { describe, expect, test } from "vitest";

import { prisma } from "@/lib/prisma";

describe("challenge persistence contract", () => {
  test("keeps one challenge progress row per user and challenge across duplicate-path writes", async () => {
    const userId = randomUUID();
    const challengeId = `test-challenge-${randomUUID()}`;

    try {
      await prisma.challengeProgress.create({
        data: {
          userId,
          challengeId,
          unlockedCountryCodes: ["JP"],
          uniqueTargetCount: 1,
        },
      });

      await prisma.challengeProgress.upsert({
        where: {
          userId_challengeId: {
            userId,
            challengeId,
          },
        },
        create: {
          userId,
          challengeId,
          unlockedCountryCodes: ["JP", "KR"],
          uniqueTargetCount: 2,
        },
        update: {
          unlockedCountryCodes: ["JP", "KR"],
          uniqueTargetCount: 2,
        },
      });

      const rows = await prisma.challengeProgress.findMany({
        where: { userId, challengeId },
      });

      expect(rows).toHaveLength(1);
      expect(rows[0]?.uniqueTargetCount).toBe(2);
      expect(rows[0]?.unlockedCountryCodes).toEqual(["JP", "KR"]);
    } finally {
      await prisma.challengeProgress.deleteMany({
        where: { userId, challengeId },
      });
    }
  });
});
