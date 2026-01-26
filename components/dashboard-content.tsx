"use client";

import { useState, useEffect } from "react";
import { WorldMap } from "./world-map";
import { CountryDrawer } from "./country-drawer";
import { AddRestaurantModal } from "./add-restaurant-modal";
import { getRestaurantsByCountry } from "@/lib/actions";
import type { Restaurant } from "@/lib/types";

interface DashboardContentProps {
  countryVisits: Map<string, number>;
}

export function DashboardContent({ countryVisits }: DashboardContentProps) {
  const [selectedCountry, setSelectedCountry] = useState<{
    code: string;
    name: string;
  } | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (selectedCountry) {
      setLoading(true);
      getRestaurantsByCountry(selectedCountry.code).then((data) => {
        setRestaurants(data);
        setLoading(false);
      });
    }
  }, [selectedCountry]);

  const handleCountryClick = (code: string, name: string) => {
    setSelectedCountry({ code, name });
  };

  const handleCloseDrawer = () => {
    setSelectedCountry(null);
    setRestaurants([]);
  };

  const handleAddRestaurant = () => {
    setShowAddModal(true);
  };

  const handleRestaurantAdded = () => {
    setShowAddModal(false);
    // Refresh restaurants
    if (selectedCountry) {
      getRestaurantsByCountry(selectedCountry.code).then(setRestaurants);
    }
  };

  return (
    <div className="relative">
      <WorldMap
        countryVisits={countryVisits}
        onCountryClick={handleCountryClick}
      />

      {/* Country Drawer */}
      <CountryDrawer
        country={selectedCountry}
        restaurants={restaurants}
        loading={loading}
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
