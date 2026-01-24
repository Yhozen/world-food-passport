import { getCountryVisits, getUserStats } from "@/lib/actions";
import { DashboardContent } from "@/components/dashboard-content";

export default async function DashboardPage() {
  const [countryVisits, stats] = await Promise.all([
    getCountryVisits(),
    getUserStats(),
  ]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">
          Your World Map
        </h1>
        <p className="text-muted-foreground">
          Click any country to view or add restaurants
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 border-4 border-black bg-primary text-black shadow-[4px_4px_0px_0px_#000]">
          <div className="text-4xl font-bold">{stats.totalCountries}</div>
          <div className="text-sm font-mono uppercase">Countries</div>
        </div>
        <div className="p-4 border-4 border-black bg-secondary text-black shadow-[4px_4px_0px_0px_#000]">
          <div className="text-4xl font-bold">{stats.totalRestaurants}</div>
          <div className="text-sm font-mono uppercase">Restaurants</div>
        </div>
        <div className="p-4 border-4 border-black bg-accent text-black shadow-[4px_4px_0px_0px_#000]">
          <div className="text-4xl font-bold">{stats.totalPhotos}</div>
          <div className="text-sm font-mono uppercase">Photos</div>
        </div>
      </div>

      {/* Map with Country Drawer */}
      <DashboardContent countryVisits={countryVisits} />
    </div>
  );
}
