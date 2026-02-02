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
