import Link from "next/link";
import { notFound } from "next/navigation";
import { neonAuth } from "@neondatabase/auth/next/server";
import { Calendar, MapPin, Users } from "lucide-react";
import { getSharedVisitByCode, joinSharedVisit } from "@/lib/actions";
import { SharedVisitGallery } from "./_components/shared-visit-gallery";

interface SharedVisitPageProps {
  params: Promise<{ code: string }>;
}

export default async function SharedVisitPage({ params }: SharedVisitPageProps) {
  const { code } = await params;
  const { user } = await neonAuth();
  const data = await getSharedVisitByCode(code);

  if (!data) {
    notFound();
  }

  const { sharedVisit, isMember, photos } = data;
  const restaurant = sharedVisit.restaurant;

  async function handleJoinSharedVisit(formData: FormData) {
    "use server";
    await joinSharedVisit(formData);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(70%_80%_at_50%_0%,#fff7e6_0%,#f4f1ea_55%,#efe8dc_100%)] text-slate-950">
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Shared visit
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950 md:text-3xl">
              {restaurant.name}
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
            <Users className="h-4 w-4" />
            Friends can add photos
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            {restaurant.city && (
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {restaurant.city}, {restaurant.countryName}
              </span>
            )}
            {restaurant.visitDate && (
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(restaurant.visitDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {!user ? (
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-amber-900">
              Join to add your photos
            </h2>
            <p className="mt-2 text-sm text-amber-800">
              Sign in or create an account to join this shared visit.
            </p>
            <Link
              href="/auth/sign-in"
              className="mt-4 inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Sign in to join
            </Link>
          </div>
        ) : !isMember ? (
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-amber-900">
              Join this visit
            </h2>
            <p className="mt-2 text-sm text-amber-800">
              You will be able to view and add photos with your friends.
            </p>
            <form action={handleJoinSharedVisit} className="mt-4">
              <input type="hidden" name="share_code" value={code} />
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Join shared visit
              </button>
            </form>
          </div>
        ) : (
          <SharedVisitGallery
            restaurantId={sharedVisit.restaurantId}
            initialPhotos={photos}
          />
        )}
      </div>
    </main>
  );
}
