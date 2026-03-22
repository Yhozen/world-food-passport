export interface ChallengeCatalogItem {
  id: string;
  targetCountryCodes: readonly string[];
  milestones: readonly number[];
  completionUnlockKey: string;
}

export const asianTopCuisinesChallenge: ChallengeCatalogItem = {
  id: "asian-top-cuisines",
  targetCountryCodes: ["CN", "JP", "KR", "TH", "IN"],
  milestones: [1, 3, 5],
  completionUnlockKey: "completion",
};

export const challengeCatalog: readonly ChallengeCatalogItem[] = [
  asianTopCuisinesChallenge,
];
