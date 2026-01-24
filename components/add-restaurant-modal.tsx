"use client";

import { useState, useTransition } from "react";
import { X, Star, Lock, Loader2 } from "lucide-react";
import { createRestaurant } from "@/lib/actions";

interface AddRestaurantModalProps {
  country: { code: string; name: string };
  onClose: () => void;
  onSuccess: () => void;
}

export function AddRestaurantModal({
  country,
  onClose,
  onSuccess,
}: AddRestaurantModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const result = await createRestaurant(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onSuccess();
      }
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-50"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:max-h-[90vh] bg-card border-4 border-black shadow-[8px_8px_0px_0px_#000] z-50 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b-4 border-black p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold uppercase">Add Restaurant</h2>
            <p className="text-sm text-muted-foreground font-mono">
              {country.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 border-4 border-black bg-background flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="p-6 space-y-6">
          {/* Hidden fields */}
          <input type="hidden" name="country_code" value={country.code} />
          <input type="hidden" name="country_name" value={country.name} />
          <input type="hidden" name="rating" value={rating} />

          {error && (
            <div className="p-4 border-4 border-black bg-destructive text-destructive-foreground font-bold">
              {error}
            </div>
          )}

          {/* Restaurant Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-bold uppercase mb-2"
            >
              Restaurant Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 border-4 border-black bg-background text-foreground font-mono focus:outline-none focus:ring-4 focus:ring-primary/50"
              placeholder="e.g., Sushi Jiro"
            />
          </div>

          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-bold uppercase mb-2"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              className="w-full px-4 py-3 border-4 border-black bg-background text-foreground font-mono focus:outline-none focus:ring-4 focus:ring-primary/50"
              placeholder="e.g., Tokyo"
            />
          </div>

          {/* Visit Date */}
          <div>
            <label
              htmlFor="visit_date"
              className="block text-sm font-bold uppercase mb-2"
            >
              Visit Date
            </label>
            <input
              type="date"
              id="visit_date"
              name="visit_date"
              className="w-full px-4 py-3 border-4 border-black bg-background text-foreground font-mono focus:outline-none focus:ring-4 focus:ring-primary/50"
            />
          </div>

          {/* Cuisine Tags */}
          <div>
            <label
              htmlFor="cuisine_tags"
              className="block text-sm font-bold uppercase mb-2"
            >
              Cuisine Tags
            </label>
            <input
              type="text"
              id="cuisine_tags"
              name="cuisine_tags"
              className="w-full px-4 py-3 border-4 border-black bg-background text-foreground font-mono focus:outline-none focus:ring-4 focus:ring-primary/50"
              placeholder="e.g., sushi, japanese, omakase"
            />
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              Separate tags with commas
            </p>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-bold uppercase mb-2">
              Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "text-secondary fill-current"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <button
                  type="button"
                  onClick={() => setRating(0)}
                  className="ml-2 text-xs text-muted-foreground underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Private Review */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-accent" />
              <label
                htmlFor="review"
                className="text-sm font-bold uppercase text-accent"
              >
                Private Review
              </label>
            </div>
            <div className="relative">
              <textarea
                id="review"
                name="review"
                rows={4}
                className="w-full px-4 py-3 border-4 border-accent/50 bg-accent/10 text-foreground font-mono focus:outline-none focus:ring-4 focus:ring-accent/50 resize-none"
                placeholder="Write your honest thoughts... Only you can see this."
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-accent font-mono">
                <Lock className="w-3 h-3" />
                <span>Only you</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t-4 border-black">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-4 border-black bg-background text-foreground font-bold uppercase hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-4 border-black bg-primary text-black font-bold uppercase shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000] transition-all disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save to Passport"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
