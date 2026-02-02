"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";

interface SelectedCountry {
  code: string;
  name: string;
}

export function useCountrySelection() {
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(
    null,
  );
  const trpc = useTRPC();
  const restaurantsQuery = useQuery({
    ...trpc.restaurants.byCountry.queryOptions({
      countryCode: selectedCountry?.code ?? "",
    }),
    enabled: Boolean(selectedCountry),
  });
  const restaurants = restaurantsQuery.data ?? [];

  function openCountry(code: string, name: string) {
    setSelectedCountry({ code, name });
  }

  function closeCountry() {
    setSelectedCountry(null);
  }

  function refreshRestaurants() {
    if (!selectedCountry) return;
    restaurantsQuery.refetch();
  }

  return {
    selectedCountry,
    restaurants,
    isLoading: restaurantsQuery.isFetching,
    openCountry,
    closeCountry,
    refreshRestaurants,
  };
}
