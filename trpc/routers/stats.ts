import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { restaurantSchema } from "@/trpc/routers/schemas";

export const statsRouter = createTRPCRouter({
  getCountryVisits: protectedProcedure
    .output(z.record(z.string(), z.number().int()))
    .query(async ({ ctx }) => {
      const result = await prisma.countriesVisited.findMany({
        where: { userId: ctx.user.id },
        select: { countryCode: true, visitCount: true },
      });

      return Object.fromEntries(
        result.map((row) => [row.countryCode, row.visitCount]),
      );
    }),
  getUserStats: protectedProcedure
    .output(
      z.object({
        totalCountries: z.number().int(),
        totalRestaurants: z.number().int(),
        totalPhotos: z.number().int(),
        cuisineBreakdown: z.array(
          z.object({
            cuisine: z.string(),
            count: z.number().int(),
          }),
        ),
        recentVisits: z.array(restaurantSchema),
      }),
    )
    .query(async ({ ctx }) => {
      const [
        totalCountries,
        totalRestaurants,
        totalPhotos,
        cuisineRows,
        recentVisits,
      ] = await Promise.all([
        prisma.countriesVisited.count({
          where: {
            userId: ctx.user.id,
            visitCount: { gt: 0 },
          },
        }),
        prisma.restaurant.count({
          where: { userId: ctx.user.id },
        }),
        prisma.photo.count({
          where: { userId: ctx.user.id },
        }),
        prisma.restaurant.findMany({
          where: { userId: ctx.user.id },
          select: { cuisineTags: true },
        }),
        prisma.restaurant.findMany({
          where: { userId: ctx.user.id },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

      const cuisineMap = new Map<string, number>();
      for (const row of cuisineRows) {
        for (const tag of row.cuisineTags) {
          cuisineMap.set(tag, (cuisineMap.get(tag) ?? 0) + 1);
        }
      }

      const cuisineBreakdown = Array.from(cuisineMap.entries())
        .map(([cuisine, count]) => ({ cuisine, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalCountries,
        totalRestaurants,
        totalPhotos,
        cuisineBreakdown,
        recentVisits,
      };
    }),
});
