import { DM_Sans } from "next/font/google";
import worldCountries from "world-countries";
import { DashboardMap } from "@/components/dashboard/dashboard-map";
import { getCountryVisits } from "@/lib/actions";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default async function DashboardMapPage() {
  const countryVisits = await getCountryVisits();
  const countriesData = worldCountries as Array<{
    cca2?: string;
    cca3: string;
    name: { common: string };
  }>;
  const nameByIso3 = Object.fromEntries(
    countriesData.map((country) => [country.cca3, country.name.common]),
  ) as Record<string, string>;
  const iso2ByIso3 = Object.fromEntries(
    countriesData
      .filter((country) => country.cca2)
      .map((country) => [country.cca3, country.cca2]),
  ) as Record<string, string>;
  const iso3ByIso2 = Object.fromEntries(
    countriesData
      .filter((country) => country.cca2)
      .map((country) => [country.cca2, country.cca3]),
  ) as Record<string, string>;
  const visitCounts = Object.fromEntries(
    Array.from(countryVisits.entries())
      .map(([iso2, count]) => {
        const iso3 = iso3ByIso2[iso2];
        return iso3 ? [iso3, count] : null;
      })
      .filter((entry): entry is [string, number] => Boolean(entry)),
  );
  const visitedIso3 = Object.keys(visitCounts);

  return (
    <div
      className={`${dmSans.className} min-h-screen bg-[radial-gradient(70%_80%_at_50%_0%,#fff7e6_0%,#f4f1ea_55%,#efe8dc_100%)] text-slate-950`}
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <section>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Dashboard
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            World map
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            Countries with entries are highlighted so you can track your food
            passport at a glance.
          </p>
        </section>

        <section className="mt-8">
          <DashboardMap
            visitedIso3={visitedIso3}
            visitCounts={visitCounts}
            nameByIso3={nameByIso3}
            iso2ByIso3={iso2ByIso3}
          />
        </section>
      </div>
    </div>
  );
}
