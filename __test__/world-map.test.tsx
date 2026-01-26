import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorldMap } from "@/components/world-map";

test("renders ISO3 countries from world data", () => {
  render(
    <WorldMap countryVisits={new Map()} onCountryClick={() => undefined} />,
  );

  expect(
    screen.getByRole("button", {
      name: "BOL",
    }),
  ).toBeDefined();
});
