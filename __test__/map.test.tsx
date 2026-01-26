import React from "react";
import { afterEach, expect, test, vi } from "vitest";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import ClickableWorldMapPreview from "@/components/map";

const mockGeographies = [
  {
    rsmKey: "geo-usa",
    id: "USA",
    properties: { name: "United States" },
  },
  {
    rsmKey: "geo-can",
    id: "CAN",
    properties: { name: "Canada" },
  },
];

vi.mock("react-simple-maps", () => {
  return {
    ComposableMap: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="map">{children}</div>
    ),
    ZoomableGroup: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="zoom">{children}</div>
    ),
    Geographies: ({ children }: { children: ({ geographies }: { geographies: any[] }) => React.ReactNode }) =>
      children({ geographies: mockGeographies }),
    Geography: ({
      onClick,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      onKeyDown,
      "aria-label": ariaLabel,
    }: {
      onClick?: () => void;
      onMouseEnter?: () => void;
      onMouseLeave?: () => void;
      onFocus?: () => void;
      onBlur?: () => void;
      onKeyDown?: (event: React.KeyboardEvent) => void;
      "aria-label"?: string;
    }) => (
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => onClick?.()}
        onMouseEnter={() => onMouseEnter?.()}
        onMouseLeave={() => onMouseLeave?.()}
        onFocus={() => onFocus?.()}
        onBlur={() => onBlur?.()}
        onKeyDown={(event) => onKeyDown?.(event)}
      >
        {ariaLabel}
      </button>
    ),
  };
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

test("emits country payload on click", () => {
  const handleClick = vi.fn();

  render(
    <ClickableWorldMapPreview
      visitCounts={{ USA: 2 }}
      nameByIso3={{ USA: "United States" }}
      iso2ByIso3={{ USA: "US" }}
      onCountryClick={handleClick}
    />,
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: "United States · 2 restaurants",
    }),
  );

  expect(handleClick).toHaveBeenCalledWith(
    expect.objectContaining({
      iso3: "USA",
      iso2: "US",
      name: "United States",
      visitCount: 2,
      isVisited: true,
    }),
  );
});

test("filters geographies when filterGeo returns false", () => {
  render(
    <ClickableWorldMapPreview
      filterGeo={(payload) => payload.iso3 !== "CAN"}
    />,
  );

  expect(
    screen.queryByRole("button", {
      name: /Canada · 0 restaurants/i,
    }),
  ).toBeNull();
});

test("debounces hover callback", () => {
  vi.useFakeTimers();
  const handleHover = vi.fn();

  render(
    <ClickableWorldMapPreview
      onCountryHover={handleHover}
      hoverDebounceMs={50}
    />,
  );

  fireEvent.mouseEnter(
    screen.getByRole("button", {
      name: /United States/i,
    }),
  );

  expect(handleHover).not.toHaveBeenCalled();

  vi.advanceTimersByTime(60);

  expect(handleHover).toHaveBeenCalledWith(
    expect.objectContaining({
      iso3: "USA",
    }),
  );
});

test("does not emit click for disabled countries", () => {
  const handleClick = vi.fn();

  render(
    <ClickableWorldMapPreview
      isCountryDisabled={(payload) => payload.iso3 === "USA"}
      onCountryClick={handleClick}
    />,
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: /United States/i,
    }),
  );

  expect(handleClick).not.toHaveBeenCalled();
});
