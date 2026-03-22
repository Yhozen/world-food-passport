import { createTRPCRouter } from "../init";
import { challengesRouter } from "./challenges";
import { mapsRouter } from "./maps";
import { photosRouter } from "./photos";
import { restaurantsRouter } from "./restaurants";
import { reviewsRouter } from "./reviews";
import { sharedVisitsRouter } from "./shared-visits";
import { statsRouter } from "./stats";

export const appRouter = createTRPCRouter({
  challenges: challengesRouter,
  maps: mapsRouter,
  photos: photosRouter,
  restaurants: restaurantsRouter,
  reviews: reviewsRouter,
  sharedVisits: sharedVisitsRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;
