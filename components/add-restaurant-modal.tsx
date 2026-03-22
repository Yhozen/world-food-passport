"use client";

import { useMutation } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { Link2, Loader2, Lock, Star } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTRPC } from "@/trpc/client";

interface AddRestaurantModalProps {
  country: { code: string; name: string };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ChallengeUnlockPayload {
  challengeId: string;
  newlyUnlockedKeys: string[];
}

export function showChallengeUnlockToast(
  challengeUnlock: ChallengeUnlockPayload | undefined,
) {
  if (!challengeUnlock?.newlyUnlockedKeys.length) return;

  toast.success("Achievement unlocked");
}

export function AddRestaurantModal({
  country,
  isOpen,
  onClose,
  onSuccess,
}: AddRestaurantModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mapsLink, setMapsLink] = useState<string>("");
  const [isFetchingPlace, setIsFetchingPlace] = useState<boolean>(false);
  const [autofillError, setAutofillError] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const trpc = useTRPC();
  const resolveMapsLink = useMutation(
    trpc.maps.resolveGoogleMapsLink.mutationOptions(),
  );
  const createRestaurant = useMutation(
    trpc.restaurants.create.mutationOptions(),
  );

  async function handleAutofill() {
    setAutofillError(null);

    if (!mapsLink.trim()) {
      setAutofillError("Paste a Google Maps link to autofill details.");
      return;
    }

    setIsFetchingPlace(true);
    try {
      const result = await resolveMapsLink.mutateAsync({ link: mapsLink });
      setIsFetchingPlace(false);

      if ("error" in result) {
        setAutofillError(result.error);
        return;
      }

      setName(result.data.name || "");
      setCity(result.data.city || "");
      setAddress(result.data.address || "");
      setWebsite(result.data.website || "");
      setLatitude(result.data.latitude || "");
      setLongitude(result.data.longitude || "");

      if (typeof result.data.rating === "number") {
        setRating(Math.round(result.data.rating));
      }
    } catch (fetchError) {
      setIsFetchingPlace(false);
      setAutofillError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to fetch place details",
      );
      return;
    }

  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const visitDate = (formData.get("visit_date") as string) || null;
    const cuisineTagsInput = (formData.get("cuisine_tags") as string) || "";
    const cuisineTags = cuisineTagsInput
      ? cuisineTagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    startTransition(async () => {
      try {
        const result = await createRestaurant.mutateAsync({
          name,
          countryCode: country.code,
          countryName: country.name,
          city: city || null,
          address: address || null,
          website: website || null,
          googleMapsUrl: mapsLink || null,
          latitude: latitude || null,
          longitude: longitude || null,
          cuisineTags,
          visitDate,
          rating: rating > 0 ? rating : null,
          review: (formData.get("review") as string) || null,
        });
        showChallengeUnlockToast(result.challengeUnlock);
        onSuccess();
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to save restaurant");
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white/95 p-0 shadow-lg sm:max-w-xl">
        <DialogHeader className="border-b border-slate-200 bg-white/80 px-6 py-5">
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Add restaurant
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            {country.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          <input type="hidden" name="country_code" value={country.code} />
          <input type="hidden" name="country_name" value={country.name} />
          <input type="hidden" name="rating" value={rating} />
          <input type="hidden" name="latitude" value={latitude} />
          <input type="hidden" name="longitude" value={longitude} />

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="maps_link"
              className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
            >
              Google Maps link (optional)
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  id="maps_link"
                  name="google_maps_url"
                  value={mapsLink}
                  onChange={(event) => setMapsLink(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-10 py-2.5 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                  placeholder="https://maps.google.com/..."
                />
              </div>
              <button
                type="button"
                onClick={handleAutofill}
                disabled={isFetchingPlace}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900 disabled:opacity-60"
              >
                {isFetchingPlace ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  "Autofill"
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Paste a link to autofill name, address, rating, and location.
            </p>
            {autofillError && (
              <p className="mt-2 text-xs text-rose-600">{autofillError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
            >
              Restaurant name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              placeholder="e.g., Sushi Jiro"
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              placeholder="e.g., Tokyo"
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              placeholder="Street address"
            />
          </div>

          <div>
            <label
              htmlFor="website"
              className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
            >
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              placeholder="https://restaurant.com"
            />
          </div>

          <div>
            <label
              htmlFor="visit_date"
              className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
            >
              Visit date
            </label>
            <input
              type="date"
              id="visit_date"
              name="visit_date"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            />
          </div>

          <div>
            <label
              htmlFor="cuisine_tags"
              className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
            >
              Cuisine tags
            </label>
            <input
              type="text"
              id="cuisine_tags"
              name="cuisine_tags"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              placeholder="e.g., sushi, japanese, omakase"
            />
            <p className="mt-2 text-xs text-slate-500">
              Separate tags with commas
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Rating
            </label>
            <div className="mt-3 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="rounded-full p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= (hoveredRating || rating)
                        ? "text-amber-500 fill-current"
                        : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <button
                  type="button"
                  onClick={() => setRating(0)}
                  className="ml-2 text-xs text-slate-500 underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-600" />
              <label
                htmlFor="review"
                className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700"
              >
                Private review
              </label>
            </div>
            <div className="relative mt-3">
              <textarea
                id="review"
                name="review"
                rows={4}
                className="w-full rounded-2xl border border-amber-200/60 bg-amber-50/60 px-4 py-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 resize-none"
                placeholder="Write your honest thoughts... Only you can see this."
              />
              <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] text-amber-700">
                <Lock className="h-3 w-3" />
                <span>Only you</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save to Passport"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
