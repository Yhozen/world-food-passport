import worldCountries from "world-countries";

export interface Country {
  code: string;
  name: string;
  continent: string;
}

interface WorldCountry {
  cca3?: string;
  name?: { common?: string };
  region?: string;
  subregion?: string;
}

const CONTINENT_ORDER = [
  "North America",
  "South America",
  "Europe",
  "Asia",
  "Africa",
  "Oceania",
];

function resolveContinent(region?: string, subregion?: string): string | null {
  if (!region) return null;

  if (region === "Americas") {
    if (subregion?.includes("South America")) return "South America";
    return "North America";
  }

  if (region === "Antarctic") return "Antarctica";

  if (CONTINENT_ORDER.includes(region)) return region;

  return null;
}

export const countries: Country[] = (worldCountries as WorldCountry[])
  .map((country) => {
    const code = country.cca3?.toUpperCase?.();
    const name = country.name?.common;
    const continent = resolveContinent(country.region, country.subregion);

    if (!code || !name || !continent) return null;

    return { code, name, continent };
  })
  .filter((country): country is Country => Boolean(country))
  .filter((country) => country.code !== "ATA" && country.continent !== "Antarctica")
  .sort((a, b) => a.name.localeCompare(b.name));

export const countryMap = new Map(countries.map((c) => [c.code, c]));

export function getCountryByCode(code: string): Country | undefined {
  return countryMap.get(code.toUpperCase());
}

export function getCountryName(code: string): string {
  return countryMap.get(code.toUpperCase())?.name || code;
}

// Visit count to color mapping for the map
export function getVisitColor(visitCount: number): string {
  if (visitCount === 0) return "#333333";
  if (visitCount <= 2) return "#00FFFF";
  if (visitCount <= 5) return "#FF10F0";
  return "#BFFF00";
}

export function getVisitLevel(
  visitCount: number,
): "none" | "low" | "medium" | "high" {
  if (visitCount === 0) return "none";
  if (visitCount <= 2) return "low";
  if (visitCount <= 5) return "medium";
  return "high";
}
