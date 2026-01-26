"use client";

import ClickableWorldMapPreview from "@/components/map";

export const MapExample = () => {
  const exampleVisitCounts: Record<string, number> = {
    USA: 6,
    CAN: 3,
    MEX: 2,
    BRA: 1,
    GBR: 4,
    FRA: 5,
    ESP: 2,
    ITA: 3,
    JPN: 4,
    THA: 2,
    AUS: 1,
  };
  const exampleVisitedIso3 = Object.keys(exampleVisitCounts);
  const exampleNameByIso3: Record<string, string> = {
    USA: "United States",
    CAN: "Canada",
    MEX: "Mexico",
    BRA: "Brazil",
    GBR: "United Kingdom",
    FRA: "France",
    ESP: "Spain",
    ITA: "Italy",
    JPN: "Japan",
    THA: "Thailand",
    AUS: "Australia",
  };

  return (
    <ClickableWorldMapPreview
      visitedIso3={exampleVisitedIso3}
      visitCounts={exampleVisitCounts}
      nameByIso3={exampleNameByIso3}
      isCountryDisabled={() => true}
      className="w-full"
    />
  );
};
