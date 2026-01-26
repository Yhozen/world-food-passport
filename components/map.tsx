"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

export interface MapCountryPayload {
  id: string;
  name: string;
  iso2?: string;
  iso3: string;
  visitCount: number;
  isVisited: boolean;
}

interface ClickableWorldMapPreviewProps {
  visitedIso3?: string[];
  visitCounts?: Map<string, number> | Record<string, number>;
  nameByIso3?: Record<string, string>;
  iso2ByIso3?: Record<string, string>;
  geography?: string | object;
  projectionScale?: number;
  center?: [number, number];
  selectedIso3?: string | null;
  hoverDebounceMs?: number;
  className?: string;
  getFill?: (payload: MapCountryPayload) => string;
  getStroke?: (payload: MapCountryPayload) => string;
  filterGeo?: (payload: MapCountryPayload) => boolean;
  isCountryDisabled?: (payload: MapCountryPayload) => boolean;
  onCountryHover?: (payload: MapCountryPayload) => void;
  onCountryLeave?: () => void;
  onCountryClick?: (payload: MapCountryPayload) => void;
}

const GEO_URL =
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
const DEFAULT_UNVISITED = "#F1EFE8";
const DEFAULT_VISITED = "#E2C08D";
const DEFAULT_SELECTED = "#D5A86E";
const DEFAULT_HOVER_UNVISITED = "#F6F2EA";
const DEFAULT_HOVER_VISITED = "#E8CFAB";
const DEFAULT_STROKE = "#E2E8F0";
const SELECTED_RING = "#F5C16C";
const FOCUS_RING = "#E2E8F0";
const DEFAULT_STROKE_WIDTH = 0.5;
const DRAG_THRESHOLD = 6;

function getCountryName(props: Record<string, unknown>): string {
  return (
    (props.name as string | undefined) ||
    (props.ADMIN as string | undefined) ||
    (props.NAME as string | undefined) ||
    (props.formal_en as string | undefined) ||
    "Unknown"
  );
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

function getVisitCountValue(
  visitCounts: Map<string, number> | Record<string, number> | undefined,
  iso3: string,
) {
  if (!visitCounts) return 0;

  if (visitCounts instanceof Map) {
    return visitCounts.get(iso3) ?? 0;
  }

  return visitCounts[iso3] ?? 0;
}

export default function ClickableWorldMapPreview({
  visitedIso3 = [],
  visitCounts,
  nameByIso3,
  iso2ByIso3,
  geography = GEO_URL,
  projectionScale = 160,
  center,
  selectedIso3 = null,
  hoverDebounceMs = 75,
  className,
  getFill,
  getStroke,
  filterGeo,
  isCountryDisabled,
  onCountryHover,
  onCountryLeave,
  onCountryClick,
}: ClickableWorldMapPreviewProps) {
  const [hoveredIso3, setHoveredIso3] = useState<string | null>(null);
  const [focusedIso3, setFocusedIso3] = useState<string | null>(null);
  const [hoverPayload, setHoverPayload] = useState<MapCountryPayload | null>(
    null,
  );
  const [fallbackVisible, setFallbackVisible] = useState(false);
  const hasLoadedRef = useRef(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);

  const visitedLookup = useMemo(() => {
    return new Set(visitedIso3.map((iso) => iso.toUpperCase()));
  }, [visitedIso3]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasLoadedRef.current) setFallbackVisible(true);
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hoverPayload || !onCountryHover) return;

    const timeout = setTimeout(() => {
      onCountryHover(hoverPayload);
    }, hoverDebounceMs);

    return () => clearTimeout(timeout);
  }, [hoverPayload, hoverDebounceMs, onCountryHover]);

  function resolvePayload(geo: Record<string, unknown>): MapCountryPayload | null {
    const props = (geo.properties ?? {}) as Record<string, unknown>;
    const iso3 = getIso3FromGeo(geo);
    if (!iso3) return null;

    const name = nameByIso3?.[iso3] ?? getCountryName(props);
    const iso2 = iso2ByIso3?.[iso3];
    const visitCount = getVisitCountValue(visitCounts, iso3);
    const isVisited = visitCount > 0 || visitedLookup.has(iso3);

    return {
      id: iso3,
      name,
      iso2,
      iso3,
      visitCount,
      isVisited,
    };
  }

  function handlePointerDown(event: React.PointerEvent) {
    dragStart.current = { x: event.clientX, y: event.clientY };
    isDragging.current = false;
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!dragStart.current) return;
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
      isDragging.current = true;
    }
  }

  function handlePointerUp() {
    dragStart.current = null;
  }

  function getDefaultFill(payload: MapCountryPayload, isHovered: boolean) {
    if (payload.iso3 === selectedIso3) return DEFAULT_SELECTED;
    if (payload.isVisited) {
      return isHovered ? DEFAULT_HOVER_VISITED : DEFAULT_VISITED;
    }
    return isHovered ? DEFAULT_HOVER_UNVISITED : DEFAULT_UNVISITED;
  }

  return (
    <div
      className={className ?? "w-full"}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={(event) => event.preventDefault()}
    >
      {fallbackVisible && !hasLoadedRef.current ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-12 text-center text-sm text-slate-600">
          Map data is taking longer than expected to load.
        </div>
      ) : null}
      <ComposableMap projectionConfig={{ scale: projectionScale, center }}>
        <ZoomableGroup minZoom={1} maxZoom={8}>
          <Geographies geography={geography}>
            {({ geographies }: { geographies: any[] }) => {
              if (geographies.length > 0) hasLoadedRef.current = true;

              return geographies.map((geo: any) => {
                const payload = resolvePayload(geo);
                if (!payload) return null;
                if (filterGeo && !filterGeo(payload)) return null;

                const isHovered = payload.iso3 === hoveredIso3;
                const isSelected = payload.iso3 === selectedIso3;
                const isFocused = payload.iso3 === focusedIso3;
                const isDisabled = isCountryDisabled?.(payload) ?? false;
                const fill = getFill ? getFill(payload) : getDefaultFill(payload, isHovered);
                const stroke = getStroke ? getStroke(payload) : DEFAULT_STROKE;
                const strokeWidth = isSelected ? 1.2 : DEFAULT_STROKE_WIDTH;
                const ringStroke = isSelected ? SELECTED_RING : isFocused ? FOCUS_RING : stroke;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    tabIndex={0}
                    aria-label={`${payload.name} · ${payload.visitCount} restaurant${payload.visitCount !== 1 ? "s" : ""}`}
                    onMouseEnter={() => {
                      setHoveredIso3(payload.iso3);
                      setHoverPayload(payload);
                    }}
                    onMouseLeave={() => {
                      setHoveredIso3(null);
                      setHoverPayload(null);
                      onCountryLeave?.();
                    }}
                    onFocus={() => {
                      setFocusedIso3(payload.iso3);
                      setHoveredIso3(payload.iso3);
                      setHoverPayload(payload);
                    }}
                    onBlur={() => {
                      setFocusedIso3(null);
                      setHoveredIso3(null);
                      setHoverPayload(null);
                      onCountryLeave?.();
                    }}
                    onKeyDown={(event: React.KeyboardEvent) => {
                      if (event.key === "Enter" && !isDisabled) {
                        onCountryClick?.(payload);
                      }
                    }}
                    onClick={() => {
                      if (isDragging.current || isDisabled) {
                        isDragging.current = false;
                        return;
                      }

                      onCountryClick?.(payload);
                    }}
                    style={{
                      default: {
                        fill,
                        stroke: ringStroke,
                        strokeWidth,
                        outline: "none",
                        cursor: isDisabled ? "default" : "pointer",
                      },
                      hover: {
                        fill: getFill ? getFill(payload) : getDefaultFill(payload, true),
                        stroke: ringStroke,
                        strokeWidth,
                        outline: "none",
                        cursor: isDisabled ? "default" : "pointer",
                      },
                      pressed: {
                        fill,
                        stroke: ringStroke,
                        strokeWidth,
                        outline: "none",
                      },
                    }}
                  />
                );
              });
            }}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
