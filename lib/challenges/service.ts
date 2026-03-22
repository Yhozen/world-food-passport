import { Prisma } from "@prisma/client";

import {
  asianTopCuisinesChallenge,
  challengeCatalog,
  type ChallengeCatalogItem,
} from "@/lib/challenges/catalog";
import {
  emitAchievementUnlocked,
  emitChallengeStarted,
} from "@/lib/challenges/metrics";
import { getNewUnlocks, isTargetCountry, normalizeCountryCode } from "@/lib/challenges/logic";
import {
  enqueueChallengeRepairJob as enqueueChallengeRepairJobRecord,
  type EnqueueChallengeRepairJobInput,
} from "@/lib/challenges/repair-jobs";
import { prisma } from "@/lib/prisma";

export interface ChallengeSummaryItem {
  challengeId: string;
  enrolledAt: Date | null;
  uniqueTargetCount: number;
  unlockedCountryCodes: string[];
  unlockedAchievements: string[];
}

export interface ApplyRestaurantCreateToChallengesInput {
  userId: string;
  countryCode: string;
  createdAt: Date;
}

export interface ApplyRestaurantCreateToChallengesResult {
  challengeId: string;
  didEnroll: boolean;
  didIncrement: boolean;
  newlyUnlockedKeys: string[];
  warningCode: "challenge_write_failed" | null;
  repairJobQueued: boolean;
}

interface ApplyMutationResult {
  didEnroll: boolean;
  enrolledAt: Date | null;
  didIncrement: boolean;
  newlyUnlockedKeys: string[];
}

interface ProgressSnapshot {
  enrolledAt: Date;
  uniqueTargetCount: number;
  unlockedCountryCodes: string[];
}

function buildSummaryItem(
  challenge: ChallengeCatalogItem,
  progress: ProgressSnapshot | null,
  unlockedAchievements: string[],
): ChallengeSummaryItem {
  return {
    challengeId: challenge.id,
    enrolledAt: progress?.enrolledAt ?? null,
    uniqueTargetCount: progress?.uniqueTargetCount ?? 0,
    unlockedCountryCodes: progress?.unlockedCountryCodes ?? [],
    unlockedAchievements,
  };
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function dedupeNormalizedCountryCodes(countryCodes: readonly string[]): string[] {
  return [...new Set(countryCodes.map((countryCode) => normalizeCountryCode(countryCode)).filter(Boolean))];
}

async function getOrEnrollProgress(
  tx: Prisma.TransactionClient,
  userId: string,
  challenge: ChallengeCatalogItem,
): Promise<{ progress: ProgressSnapshot; didEnroll: boolean }> {
  const where = {
    userId_challengeId: {
      userId,
      challengeId: challenge.id,
    },
  };

  const existing = await tx.challengeProgress.findUnique({
    where,
    select: {
      enrolledAt: true,
      uniqueTargetCount: true,
      unlockedCountryCodes: true,
    },
  });

  if (existing) {
    return {
      progress: {
        enrolledAt: existing.enrolledAt,
        uniqueTargetCount: existing.uniqueTargetCount,
        unlockedCountryCodes: dedupeNormalizedCountryCodes(existing.unlockedCountryCodes),
      },
      didEnroll: false,
    };
  }

  const enrolledAt = new Date();

  try {
    const created = await tx.challengeProgress.create({
      data: {
        userId,
        challengeId: challenge.id,
        enrolledAt,
      },
      select: {
        enrolledAt: true,
        uniqueTargetCount: true,
        unlockedCountryCodes: true,
      },
    });

    return {
      progress: {
        enrolledAt: created.enrolledAt,
        uniqueTargetCount: created.uniqueTargetCount,
        unlockedCountryCodes: dedupeNormalizedCountryCodes(created.unlockedCountryCodes),
      },
      didEnroll: true,
    };
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;

    const reloaded = await tx.challengeProgress.findUniqueOrThrow({
      where,
      select: {
        enrolledAt: true,
        uniqueTargetCount: true,
        unlockedCountryCodes: true,
      },
    });

    return {
      progress: {
        enrolledAt: reloaded.enrolledAt,
        uniqueTargetCount: reloaded.uniqueTargetCount,
        unlockedCountryCodes: dedupeNormalizedCountryCodes(reloaded.unlockedCountryCodes),
      },
      didEnroll: false,
    };
  }
}

async function loadUnlockedAchievementKeys(
  tx: Prisma.TransactionClient,
  userId: string,
  challengeId: string,
): Promise<string[]> {
  const rows = await tx.challengeAchievementUnlock.findMany({
    where: { userId, challengeId },
    select: { achievementKey: true },
    orderBy: { unlockedAt: "asc" },
  });

  return rows.map((row) => row.achievementKey);
}

async function enrollOnReadIfQualified(
  tx: Prisma.TransactionClient,
  userId: string,
  challenge: ChallengeCatalogItem,
): Promise<{ enrolledAt: Date | null; didEnroll: boolean }> {
  const existing = await tx.challengeProgress.findUnique({
    where: {
      userId_challengeId: {
        userId,
        challengeId: challenge.id,
      },
    },
    select: {
      enrolledAt: true,
    },
  });

  if (existing) {
    return { enrolledAt: existing.enrolledAt, didEnroll: false };
  }

  const normalizedTargetCountries = new Set(dedupeNormalizedCountryCodes(challenge.targetCountryCodes));
  const countries = await tx.restaurant.findMany({
    where: { userId },
    select: { countryCode: true },
  });

  const hasQualifyingRestaurant = countries.some((country) =>
    normalizedTargetCountries.has(normalizeCountryCode(country.countryCode)),
  );

  if (!hasQualifyingRestaurant) {
    return { enrolledAt: null, didEnroll: false };
  }

  const enrolledAt = new Date();

  try {
    const progress = await tx.challengeProgress.create({
      data: {
        userId,
        challengeId: challenge.id,
        enrolledAt,
      },
      select: {
        enrolledAt: true,
      },
    });

    return { enrolledAt: progress.enrolledAt, didEnroll: true };
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;

    const reloaded = await tx.challengeProgress.findUniqueOrThrow({
      where: {
        userId_challengeId: {
          userId,
          challengeId: challenge.id,
        },
      },
      select: {
        enrolledAt: true,
      },
    });

    return { enrolledAt: reloaded.enrolledAt, didEnroll: false };
  }
}

export async function getChallengeSummaryForUser(userId: string): Promise<ChallengeSummaryItem[]> {
  const summaries: ChallengeSummaryItem[] = [];
  const startedEvents: Array<{ challengeId: string; enrolledAt: Date }> = [];

  for (const challenge of challengeCatalog) {
    const summary = await prisma.$transaction(async (tx) => {
      const enrollment = await enrollOnReadIfQualified(tx, userId, challenge);

      const progress = enrollment.enrolledAt
        ? await tx.challengeProgress.findUnique({
            where: {
              userId_challengeId: {
                userId,
                challengeId: challenge.id,
              },
            },
            select: {
              enrolledAt: true,
              uniqueTargetCount: true,
              unlockedCountryCodes: true,
            },
          })
        : null;

      const unlockedAchievements = await loadUnlockedAchievementKeys(tx, userId, challenge.id);

      if (enrollment.didEnroll && enrollment.enrolledAt) {
        startedEvents.push({ challengeId: challenge.id, enrolledAt: enrollment.enrolledAt });
      }

      if (!progress) {
        return buildSummaryItem(challenge, null, unlockedAchievements);
      }

      return buildSummaryItem(
        challenge,
        {
          enrolledAt: progress.enrolledAt,
          uniqueTargetCount: progress.uniqueTargetCount,
          unlockedCountryCodes: dedupeNormalizedCountryCodes(progress.unlockedCountryCodes),
        },
        unlockedAchievements,
      );
    });

    summaries.push(summary);
  }

  for (const startedEvent of startedEvents) {
    emitChallengeStarted({
      userId,
      challengeId: startedEvent.challengeId,
      enrolledAt: startedEvent.enrolledAt,
    });
  }

  return summaries;
}

export async function applyRestaurantCreateToChallenges({
  userId,
  countryCode,
  createdAt,
}: ApplyRestaurantCreateToChallengesInput): Promise<ApplyRestaurantCreateToChallengesResult> {
  const normalizedCountryCode = normalizeCountryCode(countryCode);

  if (!isTargetCountry(normalizedCountryCode)) {
    return {
      challengeId: asianTopCuisinesChallenge.id,
      didEnroll: false,
      didIncrement: false,
      newlyUnlockedKeys: [],
      warningCode: null,
      repairJobQueued: false,
    };
  }

  try {
    const mutation = await prisma.$transaction(async (tx): Promise<ApplyMutationResult> => {
      const progressSnapshot = await getOrEnrollProgress(tx, userId, asianTopCuisinesChallenge);
      const hasRecordedCreateProgress =
        progressSnapshot.progress.uniqueTargetCount > 0 ||
        progressSnapshot.progress.unlockedCountryCodes.length > 0;
      const shouldAttemptCount =
        progressSnapshot.didEnroll ||
        hasRecordedCreateProgress ||
        createdAt.getTime() > progressSnapshot.progress.enrolledAt.getTime();

      const incrementResult = shouldAttemptCount
        ? await tx.challengeProgress.updateMany({
            where: {
              userId,
              challengeId: asianTopCuisinesChallenge.id,
              NOT: {
                unlockedCountryCodes: {
                  has: normalizedCountryCode,
                },
              },
            },
            data: {
              unlockedCountryCodes: {
                push: normalizedCountryCode,
              },
              uniqueTargetCount: {
                increment: 1,
              },
            },
          })
        : { count: 0 };

      const didIncrement = incrementResult.count > 0;

      const latestProgress = await tx.challengeProgress.findUniqueOrThrow({
        where: {
          userId_challengeId: {
            userId,
            challengeId: asianTopCuisinesChallenge.id,
          },
        },
        select: {
          uniqueTargetCount: true,
        },
      });

      const previousCount = didIncrement
        ? Math.max(0, latestProgress.uniqueTargetCount - 1)
        : latestProgress.uniqueTargetCount;
      const nextUniqueTargetCount = latestProgress.uniqueTargetCount;

      const newUnlockCandidates = getNewUnlocks({
        previousCount,
        nextCount: nextUniqueTargetCount,
        alreadyUnlocked: await loadUnlockedAchievementKeys(tx, userId, asianTopCuisinesChallenge.id),
      });

      const newlyUnlockedKeys: string[] = [];

      for (const achievementKey of newUnlockCandidates) {
        try {
          await tx.challengeAchievementUnlock.create({
            data: {
              userId,
              challengeId: asianTopCuisinesChallenge.id,
              achievementKey,
            },
          });
          newlyUnlockedKeys.push(achievementKey);
        } catch (error) {
          if (!isUniqueViolation(error)) throw error;
        }
      }

      return {
        didEnroll: progressSnapshot.didEnroll,
        enrolledAt: progressSnapshot.progress.enrolledAt,
        didIncrement,
        newlyUnlockedKeys,
      };
    });

    if (mutation.didEnroll && mutation.enrolledAt) {
      emitChallengeStarted({
        userId,
        challengeId: asianTopCuisinesChallenge.id,
        enrolledAt: mutation.enrolledAt,
      });
    }

    for (const achievementKey of mutation.newlyUnlockedKeys) {
      emitAchievementUnlocked({
        userId,
        challengeId: asianTopCuisinesChallenge.id,
        achievementKey,
        unlockedAt: new Date(),
      });
    }

    return {
      challengeId: asianTopCuisinesChallenge.id,
      didEnroll: mutation.didEnroll,
      didIncrement: mutation.didIncrement,
      newlyUnlockedKeys: mutation.newlyUnlockedKeys,
      warningCode: null,
      repairJobQueued: false,
    };
  } catch {
    const repairJobQueued = await enqueueChallengeRepairJobRecord({
      userId,
      challengeId: asianTopCuisinesChallenge.id,
      reason: "challenge_write_failed",
    });

    return {
      challengeId: asianTopCuisinesChallenge.id,
      didEnroll: false,
      didIncrement: false,
      newlyUnlockedKeys: [],
      warningCode: "challenge_write_failed",
      repairJobQueued,
    };
  }
}

export async function enqueueChallengeRepairJob(
  input: EnqueueChallengeRepairJobInput,
): Promise<boolean> {
  return enqueueChallengeRepairJobRecord(input);
}
