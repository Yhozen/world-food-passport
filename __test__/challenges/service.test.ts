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

      const [unlockedCountryCodesColumn] = await prisma.$queryRaw<
        Array<{ is_nullable: string; column_default: string | null }>
      >`
        SELECT is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'challenge_progress'
          AND column_name = 'unlocked_country_codes'
      `;

      expect(unlockedCountryCodesColumn?.is_nullable).toBe("NO");
      expect(unlockedCountryCodesColumn?.column_default?.toLowerCase()).toContain(
        "array[]::text[]",
      );
    } finally {
      await prisma.challengeProgress.deleteMany({
        where: { userId, challengeId },
      });
    }
  });

  test("enforces achievement uniqueness per user challenge and key", async () => {
    const userId = randomUUID();
    const challengeId = `test-challenge-${randomUUID()}`;
    const achievementKey = "milestone_3";

    try {
      await prisma.challengeAchievementUnlock.create({
        data: {
          userId,
          challengeId,
          achievementKey,
        },
      });

      await expect(
        prisma.challengeAchievementUnlock.create({
          data: {
            userId,
            challengeId,
            achievementKey,
          },
        }),
      ).rejects.toMatchObject({ code: "P2002" });
    } finally {
      await prisma.challengeAchievementUnlock.deleteMany({
        where: { userId, challengeId, achievementKey },
      });
    }
  });

  test("applies queued as the default challenge repair job status", async () => {
    const id = randomUUID();
    const userId = randomUUID();
    const challengeId = `test-challenge-${randomUUID()}`;
    const reason = "consistency-check";

    try {
      const [job] = await prisma.$queryRaw<Array<{ id: string; status: string }>>`
        INSERT INTO "challenge_repair_jobs" (
          "id",
          "user_id",
          "challenge_id",
          "reason",
          "created_at",
          "updated_at"
        )
        VALUES (
          ${id}::uuid,
          ${userId}::uuid,
          ${challengeId},
          ${reason},
          NOW(),
          NOW()
        )
        RETURNING "id", "status"
      `;

      expect(job?.id).toBe(id);
      expect(job?.status).toBe("queued");
    } finally {
      await prisma.challengeRepairJob.deleteMany({
        where: { userId, challengeId, reason },
      });
    }
  });
});
