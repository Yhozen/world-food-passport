// @vitest-environment node
import { describe, expect, test, vi } from "vitest";

import { showChallengeUnlockToast } from "@/components/add-restaurant-modal";

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

describe("showChallengeUnlockToast", () => {
  test("triggers unlock feedback when challenge unlock payload is present", async () => {
    const { toast } = await import("sonner");

    showChallengeUnlockToast({
      challengeId: "asian-top-cuisines",
      newlyUnlockedKeys: ["milestone_1"],
    });

    expect(toast.success).toHaveBeenCalledWith("Achievement unlocked");
  });
});
