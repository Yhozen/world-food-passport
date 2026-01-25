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
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close drawer"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l-4 border-black z-50 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b-4 border-black p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary border-4 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000] font-bold text-black">
                {country.code}
              </div>
              <div>
                <h2 className="text-xl font-bold uppercase">{country.name}</h2>
                <p className="text-sm text-muted-foreground font-mono">
                  {restaurants.length} restaurant
                  {restaurants.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 border-4 border-black bg-background flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onAddRestaurant}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-4 border-black bg-primary text-black font-bold uppercase shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000] transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Restaurant
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-muted border-4 border-black animate-pulse"
                />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold uppercase mb-2">
                No restaurants yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start logging your culinary adventures in {country.name}!
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
      className="block border-4 border-black bg-background p-4 shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate">{restaurant.name}</h3>
          {restaurant.city && (
            <p className="text-sm text-muted-foreground font-mono flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {restaurant.city}
            </p>
          )}
        </div>

        {restaurant.rating && (
          <div className="flex items-center gap-1 px-2 py-1 bg-secondary border-2 border-black">
            <Star className="w-4 h-4 text-black fill-current" />
            <span className="font-bold text-black text-sm">
              {restaurant.rating}
            </span>
          </div>
        )}
      </div>

      {restaurant.cuisineTags && restaurant.cuisineTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {restaurant.cuisineTags.slice(0, 3).map((tag: string) => (
            <span
              key={tag}
              className="px-2 py-1 bg-accent/20 border-2 border-accent/50 text-xs font-mono uppercase text-accent"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {restaurant.visitDate && (
        <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground font-mono">
          <Calendar className="w-3 h-3" />
          {new Date(restaurant.visitDate).toLocaleDateString()}
        </div>
      )}

      {/* Private indicator */}
      <div className="flex items-center gap-1 mt-3 text-xs text-accent font-mono">
        <Lock className="w-3 h-3" />
        <span className="uppercase">Private review</span>
      </div>
    </Link>
  );
}
