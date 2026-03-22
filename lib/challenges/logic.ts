import {
  asianTopCuisinesChallenge,
  CHALLENGE_ACHIEVEMENT_KEYS,
  type ChallengeAchievementKey,
} from "@/lib/challenges/catalog";

const targetCountries = new Set(asianTopCuisinesChallenge.targetCountries);

export interface GetNewUnlocksInput {
  previousCount: number;
  nextCount: number;
  alreadyUnlocked: readonly ChallengeAchievementKey[];
}

export function normalizeCountryCode(value: string | null | undefined): string {
  return value?.trim().toUpperCase() ?? "";
}

export function isTargetCountry(countryCode: string | null | undefined): boolean {
  const normalizedCountryCode = normalizeCountryCode(countryCode);
  return normalizedCountryCode.length === 2 && targetCountries.has(normalizedCountryCode);
}

export function getNewUnlocks({
  previousCount,
  nextCount,
  alreadyUnlocked,
}: GetNewUnlocksInput): ChallengeAchievementKey[] {
  const unlockCandidates: ChallengeAchievementKey[] = [];

  for (const milestone of asianTopCuisinesChallenge.milestones)
    if (previousCount < milestone && nextCount >= milestone)
      unlockCandidates.push(`milestone_${milestone}` as ChallengeAchievementKey);

  const completionThreshold = asianTopCuisinesChallenge.targetCountries.length;
  if (previousCount < completionThreshold && nextCount >= completionThreshold)
    unlockCandidates.push("completion");

  const alreadyUnlockedSet = new Set(alreadyUnlocked);
  return CHALLENGE_ACHIEVEMENT_KEYS.filter(
    (achievementKey) =>
      unlockCandidates.includes(achievementKey) && !alreadyUnlockedSet.has(achievementKey),
  );
}
