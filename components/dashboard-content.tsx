"use client";

import { useMemo, useState } from "react";
import { WorldMap } from "./world-map";
import { DashboardMap } from "./dashboard/dashboard-map";
import { CountryDrawer } from "./country-drawer";
import { AddRestaurantModal } from "./add-restaurant-modal";
import { useCountrySelection } from "./dashboard/use-country-selection";
import type { MapCountryPayload } from "@/components/map";

interface DashboardContentProps {
  countryVisits: Record<string, number>;
  nameByIso3: Record<string, string>;
}

export function DashboardContent({
  countryVisits,
  nameByIso3,
}: DashboardContentProps) {
  const {
    selectedCountry,
    restaurants,
    isLoading,
    openCountry,
    closeCountry,
    refreshRestaurants,
  } = useCountrySelection();
  const [showAddModal, setShowAddModal] = useState(false);
  const [view, setView] = useState<"map" | "list">("map");

  const visitedIso3 = useMemo(
    () => Object.keys(countryVisits),
    [countryVisits]
  );

  const handleCountryClick = (code: string, name: string) => {
    if (selectedCountry?.code === code) {
      closeCountry();
      return;
    }

    openCountry(code, name);
  };

  const handleCloseDrawer = () => {
    closeCountry();
  };

  const handleAddRestaurant = () => {
    setShowAddModal(true);
  };

  const handleRestaurantAdded = () => {
    setShowAddModal(false);
    refreshRestaurants();
  };

  function handleMapClick(payload: MapCountryPayload) {
    handleCountryClick(payload.iso3, payload.name);
  }

  return (
    <div className="relative space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600">
        <span className="font-medium text-slate-900">View</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView("map")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              view === "map"
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
            }`}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              view === "list"
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {view === "map" ? (
        <DashboardMap
          visitedIso3={visitedIso3}
          visitCounts={countryVisits}
          nameByIso3={nameByIso3}
          selectedIso3={selectedCountry?.code ?? null}
          onCountryClick={handleMapClick}
        />
      ) : (
        <WorldMap
          countryVisits={countryVisits}
          onCountryClick={handleCountryClick}
        />
      )}

      <CountryDrawer
        country={selectedCountry}
        restaurants={restaurants}
        loading={isLoading}
        onClose={handleCloseDrawer}
        onAddRestaurant={handleAddRestaurant}
      />

      {selectedCountry && (
        <AddRestaurantModal
          country={selectedCountry}
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleRestaurantAdded}
        />
      )}
    </div>
  );
}
