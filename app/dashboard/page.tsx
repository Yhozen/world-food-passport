import { DM_Sans } from "next/font/google";
import { getCountryVisits, getUserStats } from "@/lib/actions";
import { DashboardContent } from "@/components/dashboard-content";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default async function DashboardPage() {
  const [countryVisits, stats] = await Promise.all([
    getCountryVisits(),
    getUserStats(),
  ]);

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
            Your world map
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            Click any country to view or add restaurants. Keep a simple, visual
            log of your visits by place.
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Countries
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-950">
              {stats.totalCountries}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Restaurants
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-950">
              {stats.totalRestaurants}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Photos
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-950">
              {stats.totalPhotos}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <DashboardContent countryVisits={countryVisits} />
        </section>
      </div>
    </div>
  );
}
