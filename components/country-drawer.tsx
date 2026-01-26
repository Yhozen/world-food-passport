"use client";

import { X, Plus, Star, MapPin, Lock, Calendar } from "lucide-react";
import type { Restaurant } from "@/lib/types";
import Link from "next/link";

interface CountryDrawerProps {
  country: { code: string; name: string } | null;
  restaurants: Restaurant[];
  loading: boolean;
  onClose: () => void;
  onAddRestaurant: () => void;
}

export function CountryDrawer({
  country,
  restaurants,
  loading,
  onClose,
  onAddRestaurant,
}: CountryDrawerProps) {
  if (!country) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close drawer"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white/95 backdrop-blur border-l border-slate-200 z-50 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100 text-sm font-semibold text-amber-900">
                {country.code}
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {country.name}
                </h2>
                <p className="text-sm text-slate-500">
                  {restaurants.length} restaurant
                  {restaurants.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onAddRestaurant}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add restaurant
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl border border-slate-200 bg-white/70 animate-pulse"
                />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 py-12 text-center">
              <MapPin className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                No restaurants yet
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Start logging your culinary adventures in {country.name}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link
      href={`/dashboard/restaurant/${restaurant.id}`}
      className="block rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900 truncate">
            {restaurant.name}
          </h3>
          {restaurant.city && (
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-3.5 w-3.5" />
              {restaurant.city}
            </p>
          )}
        </div>

        {restaurant.rating && (
          <div className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
            <Star className="h-3.5 w-3.5" />
            <span>{restaurant.rating}</span>
          </div>
        )}
      </div>

      {restaurant.cuisineTags && restaurant.cuisineTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {restaurant.cuisineTags.slice(0, 3).map((tag: string) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {restaurant.visitDate && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(restaurant.visitDate).toLocaleDateString()}
        </div>
      )}

      {/* Private indicator */}
      <div className="mt-3 flex items-center gap-2 text-xs text-amber-700">
        <Lock className="h-3.5 w-3.5" />
        <span>Private review</span>
      </div>
    </Link>
  );
}
