export const CHALLENGE_ACHIEVEMENT_KEYS = [
  "milestone_1",
  "milestone_3",
  "milestone_5",
  "completion",
] as const;

export type ChallengeAchievementKey =
  (typeof CHALLENGE_ACHIEVEMENT_KEYS)[number];

export interface ChallengeCatalogItem {
  id: "asian-top-cuisines";
  title: string;
  description: string;
  targetCountries: readonly string[];
  milestones: readonly number[];
}

export const asianTopCuisinesChallenge: ChallengeCatalogItem = {
  id: "asian-top-cuisines",
  title: "Asian top cuisines",
  description: "Log restaurants from 5 popular Asian countries.",
  targetCountries: ["CN", "JP", "KR", "TH", "IN"],
  milestones: [1, 3, 5],
};
