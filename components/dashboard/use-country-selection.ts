"use client";

import { useEffect, useState } from "react";
import { getRestaurantsByCountry } from "@/lib/actions";
import type { Restaurant } from "@/lib/types";

interface SelectedCountry {
  code: string;
  name: string;
}

export function useCountrySelection() {
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(
    null,
  );
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedCountry) return;

    setIsLoading(true);
    getRestaurantsByCountry(selectedCountry.code)
      .then((data) => setRestaurants(data))
      .finally(() => setIsLoading(false));
  }, [selectedCountry]);

  function openCountry(code: string, name: string) {
    setSelectedCountry({ code, name });
  }

  function closeCountry() {
    setSelectedCountry(null);
    setRestaurants([]);
  }

  function refreshRestaurants() {
    if (!selectedCountry) return;

    setIsLoading(true);
    getRestaurantsByCountry(selectedCountry.code)
      .then((data) => setRestaurants(data))
      .finally(() => setIsLoading(false));
  }

  return {
    selectedCountry,
    restaurants,
    isLoading,
    openCountry,
    closeCountry,
    refreshRestaurants,
  };
}
