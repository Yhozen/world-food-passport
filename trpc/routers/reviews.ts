import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const reviewsRouter = createTRPCRouter({
  save: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        content: z.string(),
      }),
    )
    .output(z.object({ success: z.literal(true) }))
    .mutation(async ({ ctx, input }) => {
      await prisma.review.upsert({
        where: {
          restaurantId_userId: {
            restaurantId: input.restaurantId,
            userId: ctx.user.id,
          },
        },
        update: {
          content: input.content,
        },
        create: {
          restaurantId: input.restaurantId,
          userId: ctx.user.id,
          content: input.content,
        },
      });

      revalidatePath("/dashboard");
      return { success: true };
    }),
});
