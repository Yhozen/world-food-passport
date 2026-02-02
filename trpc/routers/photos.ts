import { TRPCError } from "@trpc/server";
import { Buffer } from "buffer";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";

import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

const maxUploadBytes = 10 * 1024 * 1024;

export const photosRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileBase64: z.string(),
        fileSize: z.number().int().positive(),
        caption: z.string().nullable(),
      }),
    )
    .output(z.object({ success: z.literal(true), url: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!input.fileType.startsWith("image/")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid file type" });
      }

      if (input.fileSize > maxUploadBytes) {
        throw new TRPCError({
          code: "PAYLOAD_TOO_LARGE",
          message: "Image must be less than 10MB",
        });
      }

      const restaurant = await prisma.restaurant.findUnique({
        where: { id: input.restaurantId },
        select: { userId: true },
      });

      if (!restaurant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Restaurant not found" });
      }

      if (restaurant.userId !== ctx.user.id) {
        const sharedMembership = await prisma.sharedVisitMember.findFirst({
          where: {
            userId: ctx.user.id,
            sharedVisit: {
              restaurantId: input.restaurantId,
              isActive: true,
            },
          },
          select: { id: true },
        });

        if (!sharedMembership) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
      }

      const fileBuffer = Buffer.from(input.fileBase64, "base64");
      if (fileBuffer.length > maxUploadBytes) {
        throw new TRPCError({
          code: "PAYLOAD_TOO_LARGE",
          message: "Image must be less than 10MB",
        });
      }

      const blob = await put(
        `world-food-passport/${ctx.user.id}/${input.restaurantId}/${Date.now()}-${input.fileName}`,
        fileBuffer,
        {
          access: "public",
          contentType: input.fileType,
        },
      );

      await prisma.photo.create({
        data: {
          restaurantId: input.restaurantId,
          userId: ctx.user.id,
          storageUrl: blob.url,
          caption: input.caption,
        },
      });

      revalidatePath("/dashboard");
      return { success: true, url: blob.url };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.literal(true) }))
    .mutation(async ({ ctx, input }) => {
      const photo = await prisma.photo.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      });

      if (photo) {
        try {
          await del(photo.storageUrl);
        } catch {
          // Ignore blob deletion failures
        }
      }

      await prisma.photo.deleteMany({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      });

      revalidatePath("/dashboard");
      return { success: true };
    }),
});
