import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { cache } from "react";

export const createTRPCContext = cache(async function createTRPCContext() {
  return {};
});

const trpc = initTRPC.create({
  transformer: superjson,
});

export const createTRPCRouter = trpc.router;
export const createCallerFactory = trpc.createCallerFactory;
export const baseProcedure = trpc.procedure;
