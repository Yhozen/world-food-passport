import React from "react";
import Link from "next/link";
import { DM_Sans } from "next/font/google";
import ClickableWorldMapPreview from "@/components/map";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function MapPage() {
  const visitedIso3 = [
    "USA",
    "CAN",
    "MEX",
    "BRA",
    "GBR",
    "FRA",
    "ESP",
    "ITA",
    "DEU",
    "JPN",
    "KOR",
    "THA",
    "VNM",
    "AUS",
  ];

  return (
    <main
      className={`${dmSans.className} min-h-screen bg-[radial-gradient(70%_80%_at_50%_0%,#fff7e6_0%,#f4f1ea_55%,#efe8dc_100%)] text-slate-950`}
    >
      <div className="mx-auto max-w-5xl px-6 py-8 md:py-12">
        <nav className="flex flex-wrap items-center justify-between gap-6 text-sm text-slate-600">
          <Link href="/" className="font-medium text-slate-950">
            Food Passport
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-slate-900">
              Overview
            </Link>
            <Link href="/auth/sign-in" className="hover:text-slate-900">
              Sign In
            </Link>
          </div>
        </nav>

        <section className="mt-12 text-center md:mt-16">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            World Map
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance md:text-4xl">
            A simple view of everywhere you have eaten.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            Countries with food logs are highlighted. Tap a country to see its
            ISO3 code and keep a light, visual log of your food world.
          </p>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Countries logged
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-950">
              {visitedIso3.length}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
              New cuisines
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-950">7</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Next goal
            </div>
            <div className="mt-3 text-xl font-semibold text-slate-950">
              Morocco
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
            <span className="font-medium text-slate-900">Map view</span>
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#E2C08D]" />
                Visited
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F1EFE8]" />
                Not yet
              </span>
            </div>
          </div>
          <ClickableWorldMapPreview
            visitedIso3={visitedIso3}
            projectionScale={190}
            className="w-full"
          />
        </section>
      </div>
    </main>
  );
}
