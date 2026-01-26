"use client";

import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

type SelectedCountry = {
  name: string;
  iso3?: string;
};

interface ClickableWorldMapPreviewProps {
  visitedIso3?: string[];
  projectionScale?: number;
  showSidebar?: boolean;
  className?: string;
}

// Public, lightweight world GeoJSON with ISO3 ids.
const GEO_URL =
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

function getCountryFromProps(props: Record<string, unknown>): SelectedCountry {
  const name =
    (props.name as string | undefined) ||
    (props.ADMIN as string | undefined) ||
    (props.NAME as string | undefined) ||
    (props.formal_en as string | undefined) ||
    "Unknown";

  const iso3 =
    (props.iso_a3 as string | undefined) ||
    (props.ISO_A3 as string | undefined) ||
    (props["ISO_A3"] as string | undefined);

  return { name, iso3: iso3?.toString?.()?.toUpperCase?.() };
}

function getIso3FromProps(props: Record<string, unknown>): string | undefined {
  const iso3 =
    (props.iso_a3 as string | undefined) ||
    (props.ISO_A3 as string | undefined) ||
    (props["ISO_A3"] as string | undefined);

  return iso3?.toString?.()?.toUpperCase?.();
}

function getIso3FromGeo(geo: Record<string, unknown>): string | undefined {
  const id = geo.id as string | undefined;
  if (id) return id.toUpperCase();

  const props = (geo.properties ?? {}) as Record<string, unknown>;
  return getIso3FromProps(props);
}

export default function ClickableWorldMapPreview({
  visitedIso3 = [],
  projectionScale = 160,
  showSidebar = true,
  className,
}: ClickableWorldMapPreviewProps) {
  const [selected, setSelected] = useState<SelectedCountry | null>(null);

  const selectedIso3 = selected?.iso3;

  const visitedLookup = new Set(visitedIso3.map((iso) => iso.toUpperCase()));

  return (
    <div className={className ?? "w-full"}>
      <div
        className={
          showSidebar
            ? "grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]"
            : "space-y-4"
        }
      >
        <div className="rounded-2xl border p-3 shadow-sm">
          <ComposableMap projectionConfig={{ scale: projectionScale }}>
            <ZoomableGroup minZoom={1} maxZoom={8}>
              <Geographies geography={GEO_URL}>
                {({ geographies }: { geographies: any[] }) =>
                  geographies.map((geo: any) => {
                    const props = (geo.properties ?? {}) as Record<string, unknown>;
                    const country = getCountryFromProps(props);
                    const iso3 = getIso3FromGeo(geo);

                    if (iso3 === "ATA" || country.name === "Antarctica") return null;

                    const isVisited = Boolean(iso3) && visitedLookup.has(iso3 ?? "");
                    const isSelected = Boolean(selectedIso3) && iso3 === selectedIso3;
                    const defaultFill = "#E5E7EB";
                    const visitedFill = "#1F2A44";
                    const selectedFill = "#9CA3AF";
                    const hoverFill = isVisited ? "#152038" : "#D1D5DB";
                    const fill = isSelected ? selectedFill : isVisited ? visitedFill : defaultFill;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => setSelected(country)}
                        style={{
                          default: {
                            fill,
                            outline: "none",
                          },
                          hover: {
                            fill: hoverFill,
                            outline: "none",
                            cursor: "pointer",
                          },
                          pressed: {
                            fill: selectedFill,
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {showSidebar ? (
          <aside className="rounded-2xl border p-4 shadow-sm">
            <div className="text-sm text-gray-500">Selected country</div>
            <div className="mt-1 text-xl font-semibold">
              {selected?.name ?? "Click a country"}
            </div>

            {selected?.iso3 && (
              <div className="mt-3 text-sm text-gray-700">
                <span className="text-gray-500">ISO3:</span> {selected.iso3}
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500">
              Next: we can attach stats keyed by ISO3 and render them here.
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
