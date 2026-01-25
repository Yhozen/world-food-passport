"use client";

import React from "react"

import {
  Globe,
  Utensils,
  Camera,
  TrendingUp,
  Award,
  Lock,
  Star,
  MapPin,
} from "lucide-react";
import type { Restaurant } from "@/lib/types";
import Link from "next/link";
import { countries } from "@/lib/countries";

interface StatsContentProps {
  stats: {
    totalCountries: number;
    totalRestaurants: number;
    totalPhotos: number;
    cuisineBreakdown: { cuisine: string; count: number }[];
    recentVisits: Restaurant[];
  };
  countryVisits: Map<string, number>;
}

export function StatsContent({ stats, countryVisits }: StatsContentProps) {
  const totalPossibleCountries = countries.length;
  const progressPercentage = Math.round(
    (stats.totalCountries / totalPossibleCountries) * 100
  );

  // Calculate foodie level
  const getFoodieLevel = () => {
    if (stats.totalRestaurants >= 100) return { level: "Master Chef", color: "bg-primary" };
    if (stats.totalRestaurants >= 50) return { level: "Food Expert", color: "bg-secondary" };
    if (stats.totalRestaurants >= 25) return { level: "Adventurer", color: "bg-accent" };
    if (stats.totalRestaurants >= 10) return { level: "Explorer", color: "bg-chart-4" };
    return { level: "Beginner", color: "bg-muted" };
  };

  const foodieLevel = getFoodieLevel();

  // Get top countries
  const topCountries = Array.from(countryVisits.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, count]) => ({
      code,
      name: countries.find((c) => c.code === code)?.name || code,
      count,
    }));

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Globe className="w-6 h-6" />}
          value={stats.totalCountries}
          label="Countries"
          color="bg-primary"
          subtext={`of ${totalPossibleCountries}`}
        />
        <StatCard
          icon={<Utensils className="w-6 h-6" />}
          value={stats.totalRestaurants}
          label="Restaurants"
          color="bg-secondary"
        />
        <StatCard
          icon={<Camera className="w-6 h-6" />}
          value={stats.totalPhotos}
          label="Photos"
          color="bg-accent"
        />
        <StatCard
          icon={<Award className="w-6 h-6" />}
          value={foodieLevel.level}
          label="Foodie Level"
          color={foodieLevel.color}
          isText
        />
      </div>

      {/* Progress Bar */}
      <div className="border-4 border-black bg-card p-6 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold uppercase flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            World Progress
          </h2>
          <span className="text-2xl font-bold text-primary">
            {progressPercentage}%
          </span>
        </div>
        <div className="h-8 bg-muted border-4 border-black overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground font-mono">
          {stats.totalCountries} countries visited out of {totalPossibleCountries}{" "}
          tracked
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div className="border-4 border-black bg-card p-6 shadow-[4px_4px_0px_0px_#000]">
          <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-secondary" />
            Top Countries
          </h2>
          {topCountries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Start logging restaurants to see your top destinations!
            </p>
          ) : (
            <div className="space-y-3">
              {topCountries.map((country, index) => (
                <div
                  key={country.code}
                  className="flex items-center gap-4 p-3 border-4 border-black bg-background"
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center font-bold text-black border-4 border-black shadow-[2px_2px_0px_0px_#000] ${
                      index === 0
                        ? "bg-primary"
                        : index === 1
                          ? "bg-secondary"
                          : index === 2
                            ? "bg-accent"
                            : "bg-muted"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{country.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {country.code}
                    </p>
                  </div>
                  <div className="text-2xl font-bold">{country.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cuisine Breakdown */}
        <div className="border-4 border-black bg-card p-6 shadow-[4px_4px_0px_0px_#000]">
          <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-accent" />
            Favorite Cuisines
          </h2>
          {stats.cuisineBreakdown.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Add cuisine tags to your restaurants to see your preferences!
            </p>
          ) : (
            <div className="space-y-3">
              {stats.cuisineBreakdown.map((cuisine, index) => {
                const maxCount = stats.cuisineBreakdown[0]?.count || 1;
                const percentage = (cuisine.count / maxCount) * 100;

                return (
                  <div key={cuisine.cuisine} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase text-sm">
                        {cuisine.cuisine}
                      </span>
                      <span className="font-mono text-sm">{cuisine.count}</span>
                    </div>
                    <div className="h-4 bg-muted border-2 border-black overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          index === 0
                            ? "bg-primary"
                            : index === 1
                              ? "bg-secondary"
                              : index === 2
                                ? "bg-accent"
                                : "bg-chart-4"
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

      {/* Recent Visits */}
      <div className="border-4 border-black bg-card p-6 shadow-[4px_4px_0px_0px_#000]">
        <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
          <Star className="w-5 h-5 text-secondary" />
          Recent Visits
        </h2>
        {stats.recentVisits.length === 0 ? (
          <div className="text-center py-8">
            <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No restaurants logged yet</p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 px-6 py-3 border-4 border-black bg-primary text-black font-bold uppercase shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000] transition-all"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.recentVisits.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/dashboard/restaurant/${restaurant.id}`}
                className="block p-4 border-4 border-black bg-background shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-primary border-2 border-black text-black text-xs font-bold">
                    {restaurant.countryCode}
                  </span>
                  {restaurant.rating && (
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-secondary fill-current" />
                      {restaurant.rating}
                    </span>
                  )}
                </div>
                <h3 className="font-bold truncate">{restaurant.name}</h3>
                {restaurant.city && (
                  <p className="text-sm text-muted-foreground font-mono truncate">
                    {restaurant.city}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-2 text-xs text-accent font-mono">
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
  color,
  subtext,
  isText,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color: string;
  subtext?: string;
  isText?: boolean;
}) {
  return (
    <div
      className={`${color} border-4 border-black p-6 shadow-[4px_4px_0px_0px_#000] text-black`}
    >
      <div className="flex items-center gap-2 mb-3">{icon}</div>
      <div className={`${isText ? "text-xl" : "text-4xl"} font-bold`}>
        {value}
        {subtext && (
          <span className="text-lg font-normal opacity-70"> {subtext}</span>
        )}
      </div>
      <div className="text-sm font-mono uppercase opacity-80">{label}</div>
    </div>
  );
}
