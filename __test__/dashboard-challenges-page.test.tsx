// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

const mockFetchQuery = vi.fn();
const mockQueryOptions = {
  queryKey: [["challenges"], { type: "query" }, ["getV1Summary"], { input: undefined }],
};
const mockGetV1SummaryQueryOptions = vi.fn(() => mockQueryOptions);

vi.mock("next/font/google", () => ({
  DM_Sans: () => ({ className: "dm-sans" }),
}));

vi.mock("@/trpc/server", () => ({
  getQueryClient: () => ({
    fetchQuery: mockFetchQuery,
  }),
  trpc: {
    challenges: {
      getV1Summary: {
        queryOptions: mockGetV1SummaryQueryOptions,
      },
    },
  },
}));

describe("dashboard challenges page", () => {
  test("renders asian top cuisines challenge progress card", async () => {
    mockFetchQuery.mockResolvedValueOnce([
      {
        challengeId: "asian-top-cuisines",
        title: "Asian top cuisines",
        description: "Visit major Asian cuisine countries.",
        targetCountryCodes: ["CN", "JP", "KR", "TH", "IN"],
        milestones: [1, 3, 5],
        completionThreshold: 5,
        completionUnlockKey: "completion",
        enrolledAt: new Date("2026-01-01T00:00:00.000Z"),
        uniqueTargetCount: 2,
        unlockedCountryCodes: ["JP", "KR"],
        unlockedAchievements: ["milestone_1"],
      },
    ]);

    const { default: DashboardChallengesPage } = await import(
      "@/app/dashboard/challenges/page"
    );
    const html = renderToStaticMarkup(await DashboardChallengesPage());

    expect(mockGetV1SummaryQueryOptions).toHaveBeenCalledTimes(1);
    expect(mockFetchQuery).toHaveBeenCalledWith(mockQueryOptions);

    expect(html).toContain("Asian top cuisines");
    expect(html).toContain("2 / 5 countries");
    expect(html).toContain("JP");
    expect(html).toContain("CN");
    expect(html).toContain("milestone_1");
  });
});
