export interface Country {
  code: string;
  cca3: string;
  name: string;
  continent: string;
}

export const countries: Country[] = [
  { code: "AF", cca3: "AFG", name: "Afghanistan", continent: "Asia" },
  { code: "AL", cca3: "ALB", name: "Albania", continent: "Europe" },
  { code: "DZ", cca3: "DZA", name: "Algeria", continent: "Africa" },
  { code: "AR", cca3: "ARG", name: "Argentina", continent: "South America" },
  { code: "AU", cca3: "AUS", name: "Australia", continent: "Oceania" },
  { code: "AT", cca3: "AUT", name: "Austria", continent: "Europe" },
  { code: "BE", cca3: "BEL", name: "Belgium", continent: "Europe" },
  { code: "BR", cca3: "BRA", name: "Brazil", continent: "South America" },
  { code: "CA", cca3: "CAN", name: "Canada", continent: "North America" },
  { code: "CL", cca3: "CHL", name: "Chile", continent: "South America" },
  { code: "CN", cca3: "CHN", name: "China", continent: "Asia" },
  { code: "CO", cca3: "COL", name: "Colombia", continent: "South America" },
  { code: "HR", cca3: "HRV", name: "Croatia", continent: "Europe" },
  { code: "CZ", cca3: "CZE", name: "Czech Republic", continent: "Europe" },
  { code: "DK", cca3: "DNK", name: "Denmark", continent: "Europe" },
  { code: "EG", cca3: "EGY", name: "Egypt", continent: "Africa" },
  { code: "FI", cca3: "FIN", name: "Finland", continent: "Europe" },
  { code: "FR", cca3: "FRA", name: "France", continent: "Europe" },
  { code: "DE", cca3: "DEU", name: "Germany", continent: "Europe" },
  { code: "GR", cca3: "GRC", name: "Greece", continent: "Europe" },
  { code: "HK", cca3: "HKG", name: "Hong Kong", continent: "Asia" },
  { code: "HU", cca3: "HUN", name: "Hungary", continent: "Europe" },
  { code: "IS", cca3: "ISL", name: "Iceland", continent: "Europe" },
  { code: "IN", cca3: "IND", name: "India", continent: "Asia" },
  { code: "ID", cca3: "IDN", name: "Indonesia", continent: "Asia" },
  { code: "IE", cca3: "IRL", name: "Ireland", continent: "Europe" },
  { code: "IL", cca3: "ISR", name: "Israel", continent: "Asia" },
  { code: "IT", cca3: "ITA", name: "Italy", continent: "Europe" },
  { code: "JP", cca3: "JPN", name: "Japan", continent: "Asia" },
  { code: "KR", cca3: "KOR", name: "South Korea", continent: "Asia" },
  { code: "MY", cca3: "MYS", name: "Malaysia", continent: "Asia" },
  { code: "MX", cca3: "MEX", name: "Mexico", continent: "North America" },
  { code: "MA", cca3: "MAR", name: "Morocco", continent: "Africa" },
  { code: "NL", cca3: "NLD", name: "Netherlands", continent: "Europe" },
  { code: "NZ", cca3: "NZL", name: "New Zealand", continent: "Oceania" },
  { code: "NO", cca3: "NOR", name: "Norway", continent: "Europe" },
  { code: "PE", cca3: "PER", name: "Peru", continent: "South America" },
  { code: "PH", cca3: "PHL", name: "Philippines", continent: "Asia" },
  { code: "PL", cca3: "POL", name: "Poland", continent: "Europe" },
  { code: "PT", cca3: "PRT", name: "Portugal", continent: "Europe" },
  { code: "RO", cca3: "ROU", name: "Romania", continent: "Europe" },
  { code: "RU", cca3: "RUS", name: "Russia", continent: "Europe" },
  { code: "SA", cca3: "SAU", name: "Saudi Arabia", continent: "Asia" },
  { code: "SG", cca3: "SGP", name: "Singapore", continent: "Asia" },
  { code: "ZA", cca3: "ZAF", name: "South Africa", continent: "Africa" },
  { code: "ES", cca3: "ESP", name: "Spain", continent: "Europe" },
  { code: "SE", cca3: "SWE", name: "Sweden", continent: "Europe" },
  { code: "CH", cca3: "CHE", name: "Switzerland", continent: "Europe" },
  { code: "TW", cca3: "TWN", name: "Taiwan", continent: "Asia" },
  { code: "TH", cca3: "THA", name: "Thailand", continent: "Asia" },
  { code: "TR", cca3: "TUR", name: "Turkey", continent: "Europe" },
  { code: "AE", cca3: "ARE", name: "United Arab Emirates", continent: "Asia" },
  { code: "GB", cca3: "GBR", name: "United Kingdom", continent: "Europe" },
  { code: "US", cca3: "USA", name: "United States", continent: "North America" },
  { code: "VN", cca3: "VNM", name: "Vietnam", continent: "Asia" },
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
