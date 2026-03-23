export interface ChallengeCatalogItem {
  id: string;
  title: string;
  description: string;
  targetCountryCodes: readonly string[];
  milestones: readonly number[];
  completionThreshold?: number;
  completionUnlockKey: string;
}

export const asianTopCuisinesChallenge: ChallengeCatalogItem = {
  id: "asian-top-cuisines",
  title: "Asian Top Cuisines",
  description:
    "Unlock this challenge by logging dishes from China, Japan, Korea, Thailand, and India.",
  targetCountryCodes: ["CHN", "JPN", "KOR", "THA", "IND"],
  milestones: [1, 3, 5],
  completionThreshold: 5,
  completionUnlockKey: "completion",
};

export const challengeCatalog: readonly ChallengeCatalogItem[] = [
  asianTopCuisinesChallenge,
];
