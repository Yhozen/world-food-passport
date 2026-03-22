/** @vitest-environment node */

import { describe, expect, test } from "vitest";

import {
  enrollChallengeProgress,
  listChallengeAchievementUnlocks,
  queueChallengeRepairJob,
} from "@/lib/challenges/service";

describe("challenge persistence service contract", () => {
  test("enrollChallengeProgress stores a per-user challenge row with target metadata", async () => {
    const record = await enrollChallengeProgress({
      userId: "11111111-1111-1111-1111-111111111111",
      challengeId: "asian-top-cuisines",
      uniqueTargetCount: 5,
      unlockedCountryCodes: ["JP", "TH"],
    });

    expect(record.userId).toBe("11111111-1111-1111-1111-111111111111");
    expect(record.challengeId).toBe("asian-top-cuisines");
    expect(record.uniqueTargetCount).toBe(5);
    expect(record.unlockedCountryCodes).toEqual(["JP", "TH"]);
    expect(record.completedAt).toBeNull();
  });

  test("listChallengeAchievementUnlocks resolves unique achievement keys per user challenge", async () => {
    const unlocks = await listChallengeAchievementUnlocks({
      userId: "11111111-1111-1111-1111-111111111111",
      challengeId: "asian-top-cuisines",
    });

    expect(unlocks).toEqual(expect.arrayContaining(["milestone_1", "completion"]));
  });

  test("queueChallengeRepairJob creates a queued repair task for backfill", async () => {
    const job = await queueChallengeRepairJob({
      userId: "11111111-1111-1111-1111-111111111111",
      challengeId: "asian-top-cuisines",
      reason: "backfill_on_feature_rollout",
    });

    expect(job.userId).toBe("11111111-1111-1111-1111-111111111111");
    expect(job.challengeId).toBe("asian-top-cuisines");
    expect(job.reason).toBe("backfill_on_feature_rollout");
    expect(job.status).toBe("queued");
  });
});
