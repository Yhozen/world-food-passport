export interface Country {
  code: string;
  name: string;
  continent: string;
}

export const countries: Country[] = [
  { code: "AF", name: "Afghanistan", continent: "Asia" },
  { code: "AL", name: "Albania", continent: "Europe" },
  { code: "DZ", name: "Algeria", continent: "Africa" },
  { code: "AR", name: "Argentina", continent: "South America" },
  { code: "AU", name: "Australia", continent: "Oceania" },
  { code: "AT", name: "Austria", continent: "Europe" },
  { code: "BE", name: "Belgium", continent: "Europe" },
  { code: "BR", name: "Brazil", continent: "South America" },
  { code: "CA", name: "Canada", continent: "North America" },
  { code: "CL", name: "Chile", continent: "South America" },
  { code: "CN", name: "China", continent: "Asia" },
  { code: "CO", name: "Colombia", continent: "South America" },
  { code: "HR", name: "Croatia", continent: "Europe" },
  { code: "CZ", name: "Czech Republic", continent: "Europe" },
  { code: "DK", name: "Denmark", continent: "Europe" },
  { code: "EG", name: "Egypt", continent: "Africa" },
  { code: "FI", name: "Finland", continent: "Europe" },
  { code: "FR", name: "France", continent: "Europe" },
  { code: "DE", name: "Germany", continent: "Europe" },
  { code: "GR", name: "Greece", continent: "Europe" },
  { code: "HK", name: "Hong Kong", continent: "Asia" },
  { code: "HU", name: "Hungary", continent: "Europe" },
  { code: "IS", name: "Iceland", continent: "Europe" },
  { code: "IN", name: "India", continent: "Asia" },
  { code: "ID", name: "Indonesia", continent: "Asia" },
  { code: "IE", name: "Ireland", continent: "Europe" },
  { code: "IL", name: "Israel", continent: "Asia" },
  { code: "IT", name: "Italy", continent: "Europe" },
  { code: "JP", name: "Japan", continent: "Asia" },
  { code: "KR", name: "South Korea", continent: "Asia" },
  { code: "MY", name: "Malaysia", continent: "Asia" },
  { code: "MX", name: "Mexico", continent: "North America" },
  { code: "MA", name: "Morocco", continent: "Africa" },
  { code: "NL", name: "Netherlands", continent: "Europe" },
  { code: "NZ", name: "New Zealand", continent: "Oceania" },
  { code: "NO", name: "Norway", continent: "Europe" },
  { code: "PE", name: "Peru", continent: "South America" },
  { code: "PH", name: "Philippines", continent: "Asia" },
  { code: "PL", name: "Poland", continent: "Europe" },
  { code: "PT", name: "Portugal", continent: "Europe" },
  { code: "RO", name: "Romania", continent: "Europe" },
  { code: "RU", name: "Russia", continent: "Europe" },
  { code: "SA", name: "Saudi Arabia", continent: "Asia" },
  { code: "SG", name: "Singapore", continent: "Asia" },
  { code: "ZA", name: "South Africa", continent: "Africa" },
  { code: "ES", name: "Spain", continent: "Europe" },
  { code: "SE", name: "Sweden", continent: "Europe" },
  { code: "CH", name: "Switzerland", continent: "Europe" },
  { code: "TW", name: "Taiwan", continent: "Asia" },
  { code: "TH", name: "Thailand", continent: "Asia" },
  { code: "TR", name: "Turkey", continent: "Europe" },
  { code: "AE", name: "United Arab Emirates", continent: "Asia" },
  { code: "GB", name: "United Kingdom", continent: "Europe" },
  { code: "US", name: "United States", continent: "North America" },
  { code: "VN", name: "Vietnam", continent: "Asia" },
];

export const countryMap = new Map(countries.map((c) => [c.code, c]));

export function getCountryByCode(code: string): Country | undefined {
  return countryMap.get(code);
}

export function getCountryName(code: string): string {
  return countryMap.get(code)?.name || code;
}

// Visit count to color mapping for the map
export function getVisitColor(visitCount: number): string {
  if (visitCount === 0) return "#333333"; // Dark gray - not visited
  if (visitCount <= 2) return "#00FFFF"; // Cyan - 1-2 visits
  if (visitCount <= 5) return "#FF10F0"; // Pink - 3-5 visits
  return "#BFFF00"; // Lime - 6+ visits
}

export function getVisitLevel(
  visitCount: number,
): "none" | "low" | "medium" | "high" {
  if (visitCount === 0) return "none";
  if (visitCount <= 2) return "low";
  if (visitCount <= 5) return "medium";
  return "high";
}
