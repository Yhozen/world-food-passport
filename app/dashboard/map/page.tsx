import { DM_Sans } from "next/font/google";
import ClickableWorldMapPreview from "@/components/map";
import { getCountryVisits } from "@/lib/actions";
import { countries } from "@/lib/countries";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default async function DashboardMapPage() {
  const countryVisits = await getCountryVisits();
  const byIso2 = new Map(countries.map((country) => [country.code, country.cca3]));
  const visitedIso3 = Array.from(countryVisits.keys())
    .map((code) => byIso2.get(code))
    .filter((code): code is string => Boolean(code));

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

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm md:p-6">
          <ClickableWorldMapPreview
            visitedIso3={visitedIso3}
            projectionScale={190}
            className="w-full"
          />
        </section>
      </div>
    </div>
  );
}
