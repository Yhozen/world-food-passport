import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { photoSchema, sharedVisitSchema } from "@/trpc/routers/schemas";

function generateShareCode(): string {
  return randomBytes(6).toString("base64url");
}

export const sharedVisitsRouter = createTRPCRouter({
  createLink: protectedProcedure
    .input(z.object({ restaurantId: z.string() }))
    .output(
      z.union([
        z.object({ shareCode: z.string() }),
        z.object({ error: z.string() }),
      ]),
    )
    .mutation(async ({ ctx, input }) => {
      const restaurant = await prisma.restaurant.findFirst({
        where: {
          id: input.restaurantId,
          userId: ctx.user.id,
        },
        select: { id: true },
      });

      if (!restaurant) {
        return { error: "Restaurant not found" };
      }

      const existing = await prisma.sharedVisit.findFirst({
        where: { restaurantId: input.restaurantId },
        select: { shareCode: true },
      });

      if (existing) {
        return { shareCode: existing.shareCode };
      }

      let shareCode = generateShareCode();
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          const created = await prisma.sharedVisit.create({
            data: {
              restaurantId: input.restaurantId,
              ownerUserId: ctx.user.id,
              shareCode,
            },
            select: { shareCode: true },
          });

          return { shareCode: created.shareCode };
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            shareCode = generateShareCode();
            continue;
          }
          throw error;
        }
      }

      return { error: "Could not create share link" };
    }),
  getByCode: protectedProcedure
    .input(z.object({ shareCode: z.string() }))
    .output(
      z
        .object({
          sharedVisit: sharedVisitSchema,
          isOwner: z.boolean(),
          isMember: z.boolean(),
          photos: z.array(photoSchema),
        })
        .nullable(),
    )
    .query(async ({ ctx, input }) => {
      const sharedVisit = await prisma.sharedVisit.findFirst({
        where: {
          shareCode: input.shareCode,
          isActive: true,
        },
        include: {
          restaurant: true,
          members: { select: { userId: true } },
        },
      });

      if (!sharedVisit) {
        return null;
      }

      const isOwner = sharedVisit.ownerUserId === ctx.user.id;
      const isMember =
        isOwner ||
        sharedVisit.members.some(
          (member: { userId: string }) => member.userId === ctx.user.id,
        );

      const photos = isMember
        ? await prisma.photo.findMany({
            where: { restaurantId: sharedVisit.restaurantId },
            orderBy: { uploadedAt: "desc" },
          })
        : [];

      return {
        sharedVisit: {
          id: sharedVisit.id,
          shareCode: sharedVisit.shareCode,
          restaurantId: sharedVisit.restaurantId,
          ownerUserId: sharedVisit.ownerUserId,
          restaurant: sharedVisit.restaurant,
        },
        isOwner,
        isMember,
        photos,
      };
    }),
  join: protectedProcedure
    .input(z.object({ shareCode: z.string() }))
    .output(z.object({ success: z.literal(true) }))
    .mutation(async ({ ctx, input }) => {
      if (!input.shareCode) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Share code is required",
        });
      }

      const sharedVisit = await prisma.sharedVisit.findFirst({
        where: {
          shareCode: input.shareCode,
          isActive: true,
        },
        select: { id: true },
      });

      if (!sharedVisit) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Share link not found" });
      }

      await prisma.sharedVisitMember.upsert({
        where: {
          sharedVisitId_userId: {
            sharedVisitId: sharedVisit.id,
            userId: ctx.user.id,
          },
        },
        update: {},
        create: {
          sharedVisitId: sharedVisit.id,
          userId: ctx.user.id,
        },
      });

      revalidatePath(`/share/${input.shareCode}`);
      return { success: true };
    }),
});
