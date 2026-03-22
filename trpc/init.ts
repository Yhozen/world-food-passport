import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { cache } from "react";

export const createTRPCContext = cache(async function createTRPCContext() {
  const { neonAuth } = await import("@neondatabase/auth/next/server");
  const { user } = await neonAuth();
  return { user };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const trpc = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = trpc.router;
export const createCallerFactory = trpc.createCallerFactory;
export const baseProcedure = trpc.procedure;

export const protectedProcedure = trpc.procedure.use(async (opts) => {
  const { ctx } = opts;
  const user = ctx.user;
  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
    ctx: { ...ctx, user },
  });
});
