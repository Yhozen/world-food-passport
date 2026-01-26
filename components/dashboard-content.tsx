"use client";

import { useState } from "react";
import { WorldMap } from "./world-map";
import { CountryDrawer } from "./country-drawer";
import { AddRestaurantModal } from "./add-restaurant-modal";
import { useCountrySelection } from "./dashboard/use-country-selection";

interface DashboardContentProps {
  countryVisits: Map<string, number>;
}

export function DashboardContent({ countryVisits }: DashboardContentProps) {
  const {
    selectedCountry,
    restaurants,
    isLoading,
    openCountry,
    closeCountry,
    refreshRestaurants,
  } = useCountrySelection();
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCountryClick = (code: string, name: string) => {
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
