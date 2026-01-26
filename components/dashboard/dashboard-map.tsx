"use client";

import { useState } from "react";
import ClickableWorldMapPreview, {
  MapCountryPayload,
} from "@/components/map";

interface DashboardMapProps {
  visitedIso3: string[];
  visitCounts: Record<string, number>;
  nameByIso3: Record<string, string>;
  selectedIso3: string | null;
  onCountryClick: (payload: MapCountryPayload) => void;
}

export function DashboardMap({
  visitedIso3,
  visitCounts,
  nameByIso3,
  selectedIso3,
  onCountryClick,
}: DashboardMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<MapCountryPayload | null>(
    null,
  );

  return (
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
        projectionScale={190}
        selectedIso3={selectedIso3}
        filterGeo={(payload) => payload.iso3 !== "ATA"}
        onCountryHover={(payload) => setHoveredCountry(payload)}
        onCountryLeave={() => setHoveredCountry(null)}
        onCountryClick={onCountryClick}
      />
    </div>
  );
}
