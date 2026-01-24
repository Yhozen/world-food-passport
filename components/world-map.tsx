"use client";

import { useState } from "react";
import { countries, getVisitColor, getVisitLevel } from "@/lib/countries";
import { MapPin } from "lucide-react";

interface WorldMapProps {
  countryVisits: Map<string, number>;
  onCountryClick: (countryCode: string, countryName: string) => void;
}

export function WorldMap({ countryVisits, onCountryClick }: WorldMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // Group countries by continent for a grid-based map layout
  const continents = {
    "North America": countries.filter((c) => c.continent === "North America"),
    "South America": countries.filter((c) => c.continent === "South America"),
    Europe: countries.filter((c) => c.continent === "Europe"),
    Asia: countries.filter((c) => c.continent === "Asia"),
    Africa: countries.filter((c) => c.continent === "Africa"),
    Oceania: countries.filter((c) => c.continent === "Oceania"),
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 p-4 border-4 border-black bg-card">
        <span className="font-bold uppercase text-sm">Legend:</span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-4 border-black bg-[#333333]" />
          <span className="text-sm font-mono">Not visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-4 border-black bg-accent" />
          <span className="text-sm font-mono">1-2 visits</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-4 border-black bg-secondary" />
          <span className="text-sm font-mono">3-5 visits</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-4 border-black bg-primary" />
          <span className="text-sm font-mono">6+ visits</span>
        </div>
      </div>

      {/* Map Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(continents).map(([continent, countryList]) => (
          <div
            key={continent}
            className="border-4 border-black bg-card p-4 shadow-[4px_4px_0px_0px_#000]"
          >
            <h3 className="font-bold uppercase text-sm mb-4 pb-2 border-b-4 border-black flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {continent}
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {countryList.map((country) => {
                const visits = countryVisits.get(country.code) || 0;
                const level = getVisitLevel(visits);
                const isHovered = hoveredCountry === country.code;

                return (
                  <button
                    type="button"
                    key={country.code}
                    onClick={() => onCountryClick(country.code, country.name)}
                    onMouseEnter={() => setHoveredCountry(country.code)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    className={`
                      aspect-square border-4 border-black flex items-center justify-center
                      font-bold text-xs uppercase transition-all cursor-pointer
                      ${level === "none" ? "bg-muted text-muted-foreground" : ""}
                      ${level === "low" ? "bg-accent text-black" : ""}
                      ${level === "medium" ? "bg-secondary text-black" : ""}
                      ${level === "high" ? "bg-primary text-black" : ""}
                      ${isHovered ? "scale-110 z-10 shadow-[3px_3px_0px_0px_#000]" : "shadow-[2px_2px_0px_0px_#000]"}
                    `}
                    title={`${country.name} - ${visits} restaurant${visits !== 1 ? "s" : ""}`}
                  >
                    {country.code}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Hover tooltip */}
      {hoveredCountry && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-card border-4 border-black shadow-[4px_4px_0px_0px_#000] z-50">
          <p className="font-bold uppercase">
            {countries.find((c) => c.code === hoveredCountry)?.name}
          </p>
          <p className="text-sm font-mono text-muted-foreground">
            {countryVisits.get(hoveredCountry) || 0} restaurant
            {(countryVisits.get(hoveredCountry) || 0) !== 1 ? "s" : ""} visited
          </p>
        </div>
      )}
    </div>
  );
}
