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

  function getPassportMapFill(iso3: string) {
    const visitCount = exampleVisitCounts[iso3] ?? 0;
    if (visitCount >= 5) return "#1E3557";
    if (visitCount >= 3) return "#2E8C8C";
    if (visitCount >= 1) return "#B4D8D8";
    return "#F1EFE8";
  }

  return (
    <ClickableWorldMapPreview
      visitedIso3={exampleVisitedIso3}
      visitCounts={exampleVisitCounts}
      nameByIso3={exampleNameByIso3}
      selectedIso3="FRA"
      getFill={(payload) => getPassportMapFill(payload.iso3)}
      getStroke={() => "#DCE3EE"}
      isCountryDisabled={() => true}
      className="w-full"
    />
  );
};
