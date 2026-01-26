import { DM_Sans } from "next/font/google";
import { getCountryVisits, getUserStats } from "@/lib/actions";
import { StatsContent } from "@/components/stats-content";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default async function StatsPage() {
  const [stats, countryVisits] = await Promise.all([
    getUserStats(),
    getCountryVisits(),
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
            Your stats
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            Track your culinary journey progress and see which places you are
            collecting fastest.
          </p>
        </section>

        <section className="mt-8">
          <StatsContent stats={stats} countryVisits={countryVisits} />
        </section>
      </div>
    </div>
  );
}
