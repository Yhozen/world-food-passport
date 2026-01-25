"use client";

import React, { useMemo, useState } from "react";
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

// Public, lightweight world TopoJSON (110m). Self-host later if you prefer.
const GEO_URL = "https://unpkg.com/world-atlas@2/countries-110m.json";

export default function ClickableWorldMapPreview() {
  const [selected, setSelected] = useState<SelectedCountry | null>(null);

  const selectedIso3 = selected?.iso3;

  const getCountry = useMemo(() => {
    return (props: any): SelectedCountry => {
      // Different datasets expose different keys.
      const name: string =
        props?.name ||
        props?.ADMIN ||
        props?.NAME ||
        props?.formal_en ||
        "Unknown";

      const iso3: string | undefined =
        (props?.iso_a3 || props?.ISO_A3 || props?.["ISO_A3"])
          ?.toString?.()
          ?.toUpperCase?.() || undefined;

      return { name, iso3 };
    };
  }, []);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border p-3 shadow-sm">
          <ComposableMap projectionConfig={{ scale: 160 }}>
            <ZoomableGroup minZoom={1} maxZoom={8}>
              <Geographies geography={GEO_URL}>
                {({ geographies }: { geographies: any[] }) =>
                  geographies.map((geo: any) => {
                    const props = geo.properties ?? {};
                    const iso3 =
                      (props.iso_a3 || props.ISO_A3 || props["ISO_A3"])?.toString?.()
                        ?.toUpperCase?.() ||
                      undefined;

                    const isSelected =
                      Boolean(selectedIso3) && iso3 === selectedIso3;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => setSelected(getCountry(props))}
                        style={{
                          default: {
                            fill: isSelected ? "#9CA3AF" : "#E5E7EB",
                            outline: "none",
                          },
                          hover: {
                            fill: "#D1D5DB",
                            outline: "none",
                            cursor: "pointer",
                          },
                          pressed: {
                            fill: "#9CA3AF",
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
      </div>
    </div>
  );
}
