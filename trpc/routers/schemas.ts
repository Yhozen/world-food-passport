import { Prisma } from "@prisma/client";
import { z } from "zod";

const decimalSchema = z.instanceof(Prisma.Decimal);

export const restaurantSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  countryCode: z.string(),
  countryName: z.string(),
  city: z.string().nullable(),
  address: z.string().nullable(),
  website: z.string().nullable(),
  googleMapsUrl: z.string().nullable(),
  latitude: decimalSchema.nullable(),
  longitude: decimalSchema.nullable(),
  cuisineTags: z.array(z.string()),
  visitDate: z.date().nullable(),
  rating: z.number().int().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const reviewSchema = z.object({
  id: z.string(),
  restaurantId: z.string(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const photoSchema = z.object({
  id: z.string(),
  restaurantId: z.string(),
  userId: z.string(),
  storageUrl: z.string(),
  caption: z.string().nullable(),
  uploadedAt: z.date(),
});

export const sharedVisitSchema = z.object({
  id: z.string(),
  shareCode: z.string(),
  restaurantId: z.string(),
  ownerUserId: z.string(),
  restaurant: restaurantSchema,
});

export const challengeUnlockPayloadSchema = z.object({
  challengeId: z.string(),
  newlyUnlockedKeys: z.array(z.string()),
});

export const challengeV1SummarySchema = z.object({
  challengeId: z.string(),
  title: z.string(),
  description: z.string(),
  targetCountryCodes: z.array(z.string()),
  milestones: z.array(z.number().int()),
  completionThreshold: z.number().int().nullable(),
  completionUnlockKey: z.string(),
  enrolledAt: z.date().nullable(),
  uniqueTargetCount: z.number().int(),
  unlockedCountryCodes: z.array(z.string()),
  unlockedAchievements: z.array(z.string()),
});
