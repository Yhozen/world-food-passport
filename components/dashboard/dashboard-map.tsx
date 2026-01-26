"use client";

import { useMemo, useState } from "react";
import ClickableWorldMapPreview, {
  MapCountryPayload,
} from "@/components/map";
import { CountryDrawer } from "@/components/country-drawer";
import { AddRestaurantModal } from "@/components/add-restaurant-modal";
import { useCountrySelection } from "./use-country-selection";

interface DashboardMapProps {
  visitedIso3: string[];
  visitCounts: Record<string, number>;
  nameByIso3: Record<string, string>;
  iso2ByIso3: Record<string, string>;
}

export function DashboardMap({
  visitedIso3,
  visitCounts,
  nameByIso3,
  iso2ByIso3,
}: DashboardMapProps) {
  const {
    selectedCountry,
    restaurants,
    isLoading,
    openCountry,
    closeCountry,
    refreshRestaurants,
  } = useCountrySelection();
  const [hoveredCountry, setHoveredCountry] = useState<MapCountryPayload | null>(
    null,
  );
  const [showAddModal, setShowAddModal] = useState(false);

  const iso3ByIso2 = useMemo(() => {
    return Object.fromEntries(
      Object.entries(iso2ByIso3).map(([iso3, iso2]) => [iso2, iso3]),
    ) as Record<string, string>;
  }, [iso2ByIso3]);

  const selectedIso3 = selectedCountry
    ? iso3ByIso2[selectedCountry.code]
    : null;

  function handleCountryClick(payload: MapCountryPayload) {
    if (!payload.iso2) return;

    if (selectedCountry?.code === payload.iso2) {
      closeCountry();
      return;
    }

    openCountry(payload.iso2, payload.name);
  }

  function handleAddRestaurant() {
    setShowAddModal(true);
  }

  function handleRestaurantAdded() {
    setShowAddModal(false);
    refreshRestaurants();
  }

  return (
    <div className="relative">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm md:p-6">
        <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
          <span className="font-medium text-slate-900">World map</span>
          <span className="text-slate-500">
            {hoveredCountry
              ? `${hoveredCountry.name} · ${hoveredCountry.visitCount} restaurant${
                  hoveredCountry.visitCount !== 1 ? "s" : ""
                }`
              : "Hover a country"}
          </span>
        </div>
        <ClickableWorldMapPreview
          visitedIso3={visitedIso3}
          visitCounts={visitCounts}
          nameByIso3={nameByIso3}
          iso2ByIso3={iso2ByIso3}
          projectionScale={190}
          selectedIso3={selectedIso3}
          filterGeo={(payload) => payload.iso3 !== "ATA"}
          onCountryHover={(payload) => setHoveredCountry(payload)}
          onCountryLeave={() => setHoveredCountry(null)}
          onCountryClick={handleCountryClick}
        />
      </div>

      <CountryDrawer
        country={selectedCountry}
        restaurants={restaurants}
        loading={isLoading}
        onClose={closeCountry}
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
