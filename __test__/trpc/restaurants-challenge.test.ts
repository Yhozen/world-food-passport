// @vitest-environment node
import { randomUUID } from "node:crypto";
import { describe, expect, test, vi } from "vitest";

import { applyRestaurantCreateToChallenges } from "@/lib/challenges/service";
import { prisma } from "@/lib/prisma";
import { type Context } from "@/trpc/init";
import { restaurantsRouter } from "@/trpc/routers/restaurants";

vi.mock("@neondatabase/auth/next/server", () => ({
  neonAuth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    restaurant: {
      create: vi.fn(),
    },
    review: {
      create: vi.fn(),
    },
    countriesVisited: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/challenges/service", () => ({
  applyRestaurantCreateToChallenges: vi.fn(),
}));

function createContext(userId: string): Context {
  return { user: { id: userId } } as Context;
}

describe("restaurants router challenge integration", () => {
  test("create returns unlock payload when threshold is crossed", async () => {
    const userId = randomUUID();
    const createdAt = new Date("2026-01-01T12:00:00.000Z");
    const caller = restaurantsRouter.createCaller(createContext(userId));

    const restaurantCreateMock = prisma.restaurant.create as unknown as ReturnType<typeof vi.fn>;
    const countriesVisitedUpsertMock = prisma.countriesVisited.upsert as unknown as ReturnType<
      typeof vi.fn
    >;
    const applyRestaurantCreateToChallengesMock =
      applyRestaurantCreateToChallenges as unknown as ReturnType<typeof vi.fn>;

    restaurantCreateMock.mockResolvedValueOnce({
      id: "restaurant-1",
      createdAt,
    } as never);
    countriesVisitedUpsertMock.mockResolvedValueOnce({} as never);
    applyRestaurantCreateToChallengesMock.mockResolvedValueOnce({
      challengeId: "asian-top-cuisines",
      didEnroll: false,
      didIncrement: true,
      newlyUnlockedKeys: ["milestone_1"],
      warningCode: null,
      repairJobQueued: false,
    });

    const result = await caller.create({
      name: "Ramen Place",
      countryCode: "JPN",
      countryName: "Japan",
      city: "Tokyo",
      address: null,
      website: null,
      googleMapsUrl: null,
      latitude: null,
      longitude: null,
      cuisineTags: ["ramen"],
      visitDate: null,
      rating: 5,
      review: null,
    });

    expect(result).toEqual({
      success: true,
      restaurantId: "restaurant-1",
      challengeUnlock: {
        challengeId: "asian-top-cuisines",
        newlyUnlockedKeys: ["milestone_1"],
      },
    });
    expect(applyRestaurantCreateToChallenges).toHaveBeenCalledWith({
      userId,
      countryCode: "JPN",
      createdAt,
    });
  });
});
