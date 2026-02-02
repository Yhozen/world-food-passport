import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { RestaurantDetail } from "@/components/restaurant-detail";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RestaurantPage({ params }: PageProps) {
  const { id } = await params;
  void prefetch(trpc.restaurants.getWithDetails.queryOptions({ id }));

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<RestaurantDetailFallback />}>
          <RestaurantDetail id={id} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}

function RestaurantDetailFallback() {
  return (
    <div className="min-h-screen bg-[radial-gradient(70%_80%_at_50%_0%,#fff7e6_0%,#f4f1ea_55%,#efe8dc_100%)] text-slate-950" role="status" aria-busy="true">
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="animate-pulse">
          <div className="h-5 w-28 rounded-full bg-slate-200" />

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-4">
                <div className="h-6 w-16 rounded-full bg-amber-100" />
                <div className="h-8 w-64 rounded-2xl bg-slate-200" />
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-4 w-40 rounded-full bg-slate-200" />
                  <div className="h-4 w-28 rounded-full bg-slate-200" />
                </div>
              </div>
              <div className="h-12 w-24 rounded-full border border-slate-200 bg-white" />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="h-10 w-40 rounded-full bg-slate-200" />
              <div className="h-10 w-32 rounded-full bg-slate-900/20" />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <div className="h-7 w-20 rounded-full bg-slate-200" />
              <div className="h-7 w-24 rounded-full bg-slate-200" />
              <div className="h-7 w-16 rounded-full bg-slate-200" />
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="h-6 w-24 rounded-full bg-slate-200" />
              <div className="h-10 w-28 rounded-full bg-slate-900/20" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="aspect-square rounded-2xl border border-slate-200 bg-slate-100" />
              <div className="aspect-square rounded-2xl border border-slate-200 bg-slate-100" />
              <div className="aspect-square rounded-2xl border border-slate-200 bg-slate-100" />
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50/70 p-6 shadow-sm">
            <div className="h-5 w-36 rounded-full bg-amber-200" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-full rounded-full bg-amber-200/70" />
              <div className="h-4 w-5/6 rounded-full bg-amber-200/70" />
              <div className="h-4 w-2/3 rounded-full bg-amber-200/70" />
            </div>
            <div className="mt-4 h-10 w-36 rounded-full bg-amber-200/80" />
          </div>

          <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50/70 p-6">
            <div className="h-5 w-32 rounded-full bg-rose-200" />
            <div className="mt-3 h-4 w-72 rounded-full bg-rose-200/70" />
            <div className="mt-4 h-10 w-40 rounded-full bg-rose-200/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
