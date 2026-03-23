import { z } from "zod";

import { challengeCatalog } from "@/lib/challenges/catalog";
import { getChallengeSummaryForUser } from "@/lib/challenges/service";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { challengeV1SummarySchema } from "@/trpc/routers/schemas";

export const challengesRouter = createTRPCRouter({
  getV1Summary: protectedProcedure
    .output(z.array(challengeV1SummarySchema))
    .query(async ({ ctx }) => {
      const summary = await getChallengeSummaryForUser(ctx.user.id);
      const summaryById = new Map(summary.map((item) => [item.challengeId, item]));

      return challengeCatalog.map((challenge) => {
        const progress = summaryById.get(challenge.id);

        return {
          challengeId: challenge.id,
          title: challenge.title,
          description: challenge.description,
          targetCountryCodes: [...challenge.targetCountryCodes],
          milestones: [...challenge.milestones],
          completionThreshold: challenge.completionThreshold ?? null,
          completionUnlockKey: challenge.completionUnlockKey,
          enrolledAt: progress?.enrolledAt ?? null,
          uniqueTargetCount: progress?.uniqueTargetCount ?? 0,
          unlockedCountryCodes: progress?.unlockedCountryCodes ?? [],
          unlockedAchievements: progress?.unlockedAchievements ?? [],
        };
      });
    }),
});
