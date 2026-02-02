import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";

import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { photoSchema, restaurantSchema, reviewSchema } from "@/trpc/routers/schemas";

function parseCuisineTags(tags: string[]) {
  return tags.map((tag) => tag.trim()).filter(Boolean);
}

export const restaurantsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        countryCode: z.string(),
        countryName: z.string(),
        city: z.string().nullable(),
        address: z.string().nullable(),
        website: z.string().nullable(),
        googleMapsUrl: z.string().nullable(),
        latitude: z.string().nullable(),
        longitude: z.string().nullable(),
        cuisineTags: z.array(z.string()),
        visitDate: z.string().nullable(),
        rating: z.number().int().min(0).max(5).nullable(),
        review: z.string().nullable(),
      }),
    )
    .output(
      z.object({
        success: z.literal(true),
        restaurantId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.name.trim() || !input.countryCode.trim() || !input.countryName.trim()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name and country are required",
        });
      }

      const tags = parseCuisineTags(input.cuisineTags);
      const visitDate = input.visitDate ? new Date(input.visitDate) : null;

      const restaurant = await prisma.restaurant.create({
        data: {
          userId: ctx.user.id,
          name: input.name,
          countryCode: input.countryCode,
          countryName: input.countryName,
          city: input.city,
          address: input.address,
          website: input.website,
          googleMapsUrl: input.googleMapsUrl,
          latitude: input.latitude ? new Prisma.Decimal(input.latitude) : null,
          longitude: input.longitude ? new Prisma.Decimal(input.longitude) : null,
          cuisineTags: tags,
          visitDate,
          rating: input.rating ?? null,
        },
      });

      if (input.review) {
        await prisma.review.create({
          data: {
            restaurantId: restaurant.id,
            userId: ctx.user.id,
            content: input.review,
          },
        });
      }

      await prisma.countriesVisited.upsert({
        where: {
          userId_countryCode: {
            userId: ctx.user.id,
            countryCode: input.countryCode,
          },
        },
        update: {
          visitCount: { increment: 1 },
          countryName: input.countryName,
        },
        create: {
          userId: ctx.user.id,
          countryCode: input.countryCode,
          countryName: input.countryName,
          visitCount: 1,
        },
      });

      revalidatePath("/dashboard");
      return { success: true, restaurantId: restaurant.id };
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        city: z.string().nullable(),
        cuisineTags: z.array(z.string()),
        visitDate: z.string().nullable(),
        rating: z.number().int().min(0).max(5).nullable(),
      }),
    )
    .output(z.object({ success: z.literal(true) }))
    .mutation(async ({ ctx, input }) => {
      const tags = parseCuisineTags(input.cuisineTags);
      const visitDate = input.visitDate ? new Date(input.visitDate) : null;

      const updateResult = await prisma.restaurant.updateMany({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        data: {
          name: input.name,
          city: input.city,
          cuisineTags: tags,
          visitDate,
          rating: input.rating ?? null,
        },
      });

      if (updateResult.count === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Restaurant not found" });
      }

      revalidatePath("/dashboard");
      return { success: true };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.literal(true) }))
    .mutation(async ({ ctx, input }) => {
      const restaurant = await prisma.restaurant.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        select: {
          id: true,
          countryCode: true,
        },
      });

      if (!restaurant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Restaurant not found" });
      }

      const photos = await prisma.photo.findMany({
        where: {
          restaurantId: input.id,
          userId: ctx.user.id,
        },
        select: {
          storageUrl: true,
        },
      });

      for (const photo of photos) {
        try {
          await del(photo.storageUrl);
        } catch {
          // Ignore blob deletion failures
        }
      }

      await prisma.$transaction([
        prisma.photo.deleteMany({
          where: { restaurantId: input.id },
        }),
        prisma.review.deleteMany({
          where: { restaurantId: input.id },
        }),
        prisma.restaurant.deleteMany({
          where: { id: input.id, userId: ctx.user.id },
        }),
        prisma.countriesVisited.updateMany({
          where: {
            userId: ctx.user.id,
            countryCode: restaurant.countryCode,
          },
          data: {
            visitCount: { decrement: 1 },
          },
        }),
      ]);

      revalidatePath("/dashboard");
      return { success: true };
    }),
  list: protectedProcedure
    .output(z.array(restaurantSchema))
    .query(async ({ ctx }) => {
      return prisma.restaurant.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: "desc" },
      });
    }),
  byCountry: protectedProcedure
    .input(z.object({ countryCode: z.string() }))
    .output(z.array(restaurantSchema))
    .query(async ({ ctx, input }) => {
      return prisma.restaurant.findMany({
        where: {
          userId: ctx.user.id,
          countryCode: input.countryCode,
        },
        orderBy: [{ visitDate: "desc" }, { createdAt: "desc" }],
      });
    }),
  getWithDetails: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(
      z
        .object({
          restaurant: restaurantSchema,
          review: reviewSchema.nullable(),
          photos: z.array(photoSchema),
        })
        .nullable(),
    )
    .query(async ({ ctx, input }) => {
      const restaurant = await prisma.restaurant.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      });

      if (!restaurant) return null;

      const [review, photos] = await Promise.all([
        prisma.review.findFirst({
          where: {
            restaurantId: input.id,
            userId: ctx.user.id,
          },
        }),
        prisma.photo.findMany({
          where: {
            restaurantId: input.id,
            userId: ctx.user.id,
          },
          orderBy: { uploadedAt: "desc" },
        }),
      ]);

      return {
        restaurant,
        review,
        photos,
      };
    }),
});
