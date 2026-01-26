"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  MapPin,
  Calendar,
  Lock,
  Trash2,
  Camera,
  X,
  Loader2,
  Edit3,
  Save,
} from "lucide-react";
import type { Restaurant, Review, Photo } from "@/lib/types";
import { deleteRestaurant, saveReview, deletePhoto } from "@/lib/actions";
import { PhotoUpload } from "./photo-upload";
import { useRouter } from "next/navigation";

interface RestaurantDetailProps {
  data: {
    restaurant: Restaurant;
    review: Review | null;
    photos: Photo[];
  };
}

export function RestaurantDetail({ data }: RestaurantDetailProps) {
  const { restaurant, review: initialReview, photos: initialPhotos } = data;
  const router = useRouter();

  const [photos, setPhotos] = useState(initialPhotos);
  const [review, setReview] = useState(initialReview?.content || "");
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSaveReview = () => {
    const formData = new FormData();
    formData.append("restaurant_id", restaurant.id);
    formData.append("content", review);

    startTransition(async () => {
      await saveReview(formData);
      setIsEditingReview(false);
    });
  };

  const handleDeleteRestaurant = () => {
    startTransition(async () => {
      await deleteRestaurant(restaurant.id);
      router.push("/dashboard");
    });
  };

  const handlePhotoUploaded = (url: string) => {
    setPhotos([
      { id: Date.now().toString(), storageUrl: url, caption: null } as Photo,
      ...photos,
    ]);
    setShowPhotoUpload(false);
  };

  const handleDeletePhoto = (photoId: string) => {
    startTransition(async () => {
      await deletePhoto(photoId);
      setPhotos(photos.filter((p) => p.id !== photoId));
      setSelectedPhoto(null);
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(70%_80%_at_50%_0%,#fff7e6_0%,#f4f1ea_55%,#efe8dc_100%)] text-slate-950">
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Map
        </Link>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                  {restaurant.countryCode}
                </span>
                <h1 className="text-2xl font-semibold text-slate-950 md:text-3xl">
                  {restaurant.name}
                </h1>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
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

            {restaurant.rating && (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-900 shadow-sm">
                <Star className="h-5 w-5 text-amber-500" />
                <span className="text-lg font-semibold">{restaurant.rating}</span>
              </div>
            )}
          </div>

          {restaurant.cuisineTags && restaurant.cuisineTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {restaurant.cuisineTags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Photos</h2>
            <button
              type="button"
              onClick={() => setShowPhotoUpload(true)}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add Photo
            </button>
          </div>

          {photos.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white/60 py-12 text-center">
              <Camera className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 text-sm text-slate-600">
                No photos yet. Add your first memory.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-transform hover:scale-[1.01]"
                >
                  <Image
                    src={photo.storageUrl || "/placeholder.svg"}
                    alt={photo.caption || "Restaurant photo"}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50/70 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-700" />
              <h2 className="text-lg font-semibold text-amber-900">
                Private Review
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              <Lock className="h-3 w-3" />
              Only you can see this
            </span>
          </div>

          {isEditingReview ? (
            <div className="mt-4 space-y-4">
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={6}
                className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
                placeholder="Write your honest thoughts about this restaurant..."
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingReview(false)}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReview}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save review
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              {review ? (
                <div className="prose max-w-none text-slate-700">
                  <p className="whitespace-pre-wrap">{review}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-600 italic">
                  No review written yet.
                </p>
              )}
              <button
                type="button"
                onClick={() => setIsEditingReview(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-transparent px-4 py-2 text-sm text-amber-800 transition hover:bg-amber-100"
              >
                <Edit3 className="h-4 w-4" />
                {review ? "Edit review" : "Write review"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50/70 p-6">
          <h2 className="text-lg font-semibold text-rose-700">Danger zone</h2>
          <p className="mt-2 text-sm text-rose-700/80">
            Deleting this restaurant will permanently remove all photos and
            reviews.
          </p>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
          >
            <Trash2 className="h-4 w-4" />
            Delete restaurant
          </button>
        </div>

      {showPhotoUpload && (
        <PhotoUpload
          restaurantId={restaurant.id}
          onClose={() => setShowPhotoUpload(false)}
          onSuccess={handlePhotoUploaded}
        />
      )}

      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onDelete={() => handleDeletePhoto(selectedPhoto.id)}
          isPending={isPending}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmation
          name={restaurant.name}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteRestaurant}
          isPending={isPending}
        />
      )}
      </div>
    </div>
  );
}

function PhotoLightbox({
  photo,
  onClose,
  onDelete,
  isPending,
}: {
  photo: Photo;
  onClose: () => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 z-50"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close lightbox"
      />
      <div className="fixed inset-4 md:inset-8 z-50 flex items-center justify-center">
        <div className="relative max-w-full max-h-full">
          <Image
            src={photo.storageUrl || "/placeholder.svg"}
            alt={photo.caption || "Restaurant photo"}
            width={1200}
            height={800}
            className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-slate-200 bg-white shadow-lg"
          />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={onDelete}
              disabled={isPending}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-300 bg-white text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function DeleteConfirmation({
  name,
  onCancel,
  onConfirm,
  isPending,
}: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onCancel}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
        role="button"
        tabIndex={0}
        aria-label="Close confirmation"
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900">
          Delete restaurant?
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Are you sure you want to delete <strong>{name}</strong>? This action
          cannot be undone.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-rose-300 bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </button>
        </div>
      </div>
    </>
  );
}
