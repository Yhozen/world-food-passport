"use client";

import React from "react";
import Link from "next/link";
import {
  Award,
  Camera,
  Globe,
  Lock,
  MapPin,
  Star,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { countries } from "@/lib/countries";
import type { Restaurant } from "@/lib/types";

interface StatsContentProps {
  stats: {
    totalCountries: number;
    totalRestaurants: number;
    totalPhotos: number;
    cuisineBreakdown: { cuisine: string; count: number }[];
    recentVisits: Restaurant[];
  };
  countryVisits: Record<string, number>;
}

export function StatsContent({ stats, countryVisits }: StatsContentProps) {
  const totalPossibleCountries = countries.length;
  const progressPercentage = Math.round(
    (stats.totalCountries / totalPossibleCountries) * 100
  );

  function getFoodieLevel() {
    if (stats.totalRestaurants >= 100) {
      return { level: "Master Chef", tone: "bg-amber-100 text-amber-800" };
    }

    if (stats.totalRestaurants >= 50) {
      return { level: "Food Expert", tone: "bg-rose-100 text-rose-800" };
    }

    if (stats.totalRestaurants >= 25) {
      return { level: "Adventurer", tone: "bg-emerald-100 text-emerald-800" };
    }

    if (stats.totalRestaurants >= 10) {
      return { level: "Explorer", tone: "bg-sky-100 text-sky-800" };
    }

    return { level: "Beginner", tone: "bg-slate-100 text-slate-700" };
  }

  const foodieLevel = getFoodieLevel();

  const topCountries = Object.entries(countryVisits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, count]) => ({
      code,
      name: countries.find((c) => c.code === code)?.name || code,
      count,
    }));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Globe className="w-6 h-6" />}
          value={stats.totalCountries}
          label="Countries"
          tone="bg-amber-100 text-amber-800"
          subtext={`of ${totalPossibleCountries}`}
        />
        <StatCard
          icon={<Utensils className="w-6 h-6" />}
          value={stats.totalRestaurants}
          label="Restaurants"
          tone="bg-rose-100 text-rose-800"
        />
        <StatCard
          icon={<Camera className="w-6 h-6" />}
          value={stats.totalPhotos}
          label="Photos"
          tone="bg-sky-100 text-sky-800"
        />
        <StatCard
          icon={<Award className="w-6 h-6" />}
          value={foodieLevel.level}
          label="Foodie Level"
          tone={foodieLevel.tone}
          isText
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            World Progress
          </h2>
          <span className="text-2xl font-semibold text-slate-900">
            {progressPercentage}%
          </span>
        </div>
        <div className="mt-4 h-2.5 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-slate-600">
          {stats.totalCountries} countries visited out of {totalPossibleCountries}{" "}
          tracked
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-600" />
            Top Countries
          </h2>
          {topCountries.length === 0 ? (
            <p className="text-slate-600 text-center py-8">
              Start logging restaurants to see your top destinations!
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {topCountries.map((country, index) => (
                <div
                  key={country.code}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/70 p-3"
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      index === 0
                        ? "bg-amber-100 text-amber-800"
                        : index === 1
                          ? "bg-rose-100 text-rose-800"
                          : index === 2
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{country.name}</p>
                    <p className="text-sm text-slate-500">
                      {country.code}
                    </p>
                  </div>
                  <div className="text-2xl font-semibold text-slate-900">
                    {country.count}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-600" />
            Favorite Cuisines
          </h2>
          {stats.cuisineBreakdown.length === 0 ? (
            <p className="text-slate-600 text-center py-8">
              Add cuisine tags to your restaurants to see your preferences!
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {stats.cuisineBreakdown.map((cuisine, index) => {
                const maxCount = stats.cuisineBreakdown[0]?.count || 1;
                const percentage = (cuisine.count / maxCount) * 100;

                return (
                  <div key={cuisine.cuisine} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-900">
                        {cuisine.cuisine}
                      </span>
                      <span className="text-slate-600">{cuisine.count}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          index === 0
                            ? "bg-amber-500"
                            : index === 1
                              ? "bg-rose-400"
                              : index === 2
                                ? "bg-emerald-400"
                                : "bg-slate-400"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-600" />
          Recent Visits
        </h2>
        {stats.recentVisits.length === 0 ? (
          <div className="text-center py-10">
            <Utensils className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No restaurants logged yet</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center mt-5 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.recentVisits.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/dashboard/restaurant/${restaurant.id}`}
                className="block rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                    {restaurant.countryCode}
                  </span>
                  {restaurant.rating && (
                    <span className="flex items-center gap-1 text-sm text-slate-700">
                      <Star className="w-4 h-4 text-amber-500 fill-current" />
                      {restaurant.rating}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 truncate">
                  {restaurant.name}
                </h3>
                {restaurant.city && (
                  <p className="text-sm text-slate-500 truncate">
                    {restaurant.city}
                  </p>
                )}
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  <Lock className="w-3 h-3" />
                  <span>Private</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  tone,
  subtext,
  isText,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  tone: string;
  subtext?: string;
  isText?: boolean;
}) {
  return (
    <div
      className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm"
    >
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${tone}`}>
        {icon}
      </div>
      <div
        className={`${isText ? "text-xl" : "text-3xl"} mt-4 font-semibold text-slate-950`}
      >
        {value}
        {subtext && (
          <span className="text-base font-normal text-slate-500">
            {" "}
            {subtext}
          </span>
        )}
      </div>
      <div className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">
        {label}
      </div>
    </div>
  );
}
