import { getUserStats, getCountryVisits } from "@/lib/actions";
import { StatsContent } from "@/components/stats-content";

export default async function StatsPage() {
  const [stats, countryVisits] = await Promise.all([
    getUserStats(),
    getCountryVisits(),
  ]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">
          Your Stats
        </h1>
        <p className="text-muted-foreground">
          Track your culinary journey progress
        </p>
      </div>

      <StatsContent stats={stats} countryVisits={countryVisits} />
    </div>
  );
}
