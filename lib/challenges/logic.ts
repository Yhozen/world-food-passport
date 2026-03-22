import { asianTopCuisinesChallenge } from "@/lib/challenges/catalog";
import type { ChallengeCatalogItem } from "@/lib/challenges/catalog";

export interface GetNewUnlocksInput {
  previousCount: number;
  nextCount: number;
  alreadyUnlocked: readonly string[];
}

const targetCountryCodeSet = new Set(asianTopCuisinesChallenge.targetCountryCodes);

export function normalizeCountryCode(value: string | null | undefined): string {
  return value?.trim().toUpperCase() ?? "";
}

export function isTargetCountry(countryCode: string | null | undefined): boolean {
  return targetCountryCodeSet.has(normalizeCountryCode(countryCode));
}

function getMilestoneUnlockKey(milestone: number): string {
  return `milestone_${milestone}`;
}

export function getCompletionThreshold(challenge: ChallengeCatalogItem): number {
  return challenge.completionThreshold ?? challenge.targetCountryCodes.length;
}

export function getNewUnlocks({
  previousCount,
  nextCount,
  alreadyUnlocked,
}: GetNewUnlocksInput): string[] {
  if (nextCount <= previousCount) return [];

  const alreadyUnlockedSet = new Set(alreadyUnlocked);
  const newUnlocks: string[] = [];

  for (const milestone of asianTopCuisinesChallenge.milestones) {
    const milestoneKey = getMilestoneUnlockKey(milestone);
    const crossedMilestone = previousCount < milestone && nextCount >= milestone;

    if (crossedMilestone && !alreadyUnlockedSet.has(milestoneKey)) {
      newUnlocks.push(milestoneKey);
    }
  }

  const completionMilestone = getCompletionThreshold(asianTopCuisinesChallenge);
  const crossedCompletion =
    previousCount < completionMilestone && nextCount >= completionMilestone;

  if (
    crossedCompletion &&
    !alreadyUnlockedSet.has(asianTopCuisinesChallenge.completionUnlockKey)
  ) {
    newUnlocks.push(asianTopCuisinesChallenge.completionUnlockKey);
  }

  return newUnlocks;
}
