"use client";

import { MapPin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { countries, getVisitLevel } from "@/lib/countries";

interface WorldMapProps {
  countryVisits: Map<string, number>;
  onCountryClick: (countryCode: string, countryName: string) => void;
}

export function WorldMap({ countryVisits, onCountryClick }: WorldMapProps) {
  const continents = {
    "North America": countries.filter((c) => c.continent === "North America"),
    "South America": countries.filter((c) => c.continent === "South America"),
    Europe: countries.filter((c) => c.continent === "Europe"),
    Asia: countries.filter((c) => c.continent === "Asia"),
    Africa: countries.filter((c) => c.continent === "Africa"),
    Oceania: countries.filter((c) => c.continent === "Oceania"),
  };

  const levelStyles = {
    none: "bg-slate-100 text-slate-400 border-slate-200",
    low: "bg-amber-100 text-amber-900 border-amber-200",
    medium: "bg-amber-200 text-amber-900 border-amber-300",
    high: "bg-amber-300 text-amber-900 border-amber-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600">
        <span className="font-medium text-slate-900">Legend</span>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <span>Not visited</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-100" />
          <span>1-2 visits</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-200" />
          <span>3-5 visits</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span>6+ visits</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(continents).map(([continent, countryList]) => (
          <div
            key={continent}
            className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm"
          >
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MapPin className="h-4 w-4 text-amber-500" />
              {continent}
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {countryList.map((country) => {
                const visits = countryVisits.get(country.code) || 0;
                const level = getVisitLevel(visits);

                return (
                  <Tooltip key={country.code}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onCountryClick(country.code, country.name)}
                        className={
                          `aspect-square rounded-md border text-[10px] font-medium uppercase transition-all ${levelStyles[level]} ` +
                          "hover:scale-[1.04] hover:shadow-sm hover:ring-2 hover:ring-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                        }
                      >
                        {country.code}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={6}>
                      {country.name} · {visits} restaurant{visits !== 1 ? "s" : ""}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
