import React from "react";
import Link from "next/link";
import ClickableWorldMapPreview from "../../components/map";

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
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 py-8 md:py-12">
        <nav className="flex flex-wrap items-center justify-between gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Food Passport
          </Link>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Overview
            </Link>
            <Link href="/auth/sign-in" className="hover:text-foreground">
              Sign In
            </Link>
          </div>
        </nav>
      </div>

      <div className="container mx-auto px-6 pb-16">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              World Map
            </p>
            <h1 className="text-4xl md:text-5xl font-serif leading-tight">
              A living atlas of everywhere you have eaten.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Countries with food logs are highlighted. Tap a country to see its
              ISO3 code and keep a running list of your next culinary goals.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1F2A44]" />
                Visited
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#E5E7EB]" />
                Not yet
              </span>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              This month
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Countries logged</span>
                <span className="font-semibold text-foreground">{visitedIso3.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">New cuisines</span>
                <span className="font-semibold text-foreground">7</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Next goal</span>
                <span className="font-semibold text-foreground">Morocco</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
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
