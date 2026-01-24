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
import type { Restaurant, Review, Photo } from "@/lib/db";
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
      { id: Date.now().toString(), storage_url: url, caption: null } as Photo,
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
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 font-mono text-sm uppercase"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Map
      </Link>

      {/* Header Card */}
      <div className="border-4 border-black bg-card p-6 shadow-[6px_6px_0px_0px_#000] mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="px-3 py-1 bg-primary border-4 border-black text-black font-bold text-sm">
                {restaurant.country_code}
              </div>
              <h1 className="text-3xl font-bold uppercase">{restaurant.name}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              {restaurant.city && (
                <span className="flex items-center gap-1 font-mono">
                  <MapPin className="w-4 h-4" />
                  {restaurant.city}, {restaurant.country_name}
                </span>
              )}
              {restaurant.visit_date && (
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-4 h-4" />
                  {new Date(restaurant.visit_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {restaurant.rating && (
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary border-4 border-black shadow-[3px_3px_0px_0px_#000]">
              <Star className="w-6 h-6 text-black fill-current" />
              <span className="text-2xl font-bold text-black">
                {restaurant.rating}
              </span>
            </div>
          )}
        </div>

        {/* Cuisine Tags */}
        {restaurant.cuisine_tags && restaurant.cuisine_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {restaurant.cuisine_tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-accent/20 border-2 border-accent/50 text-sm font-mono uppercase text-accent"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Photos Section */}
      <div className="border-4 border-black bg-card p-6 shadow-[6px_6px_0px_0px_#000] mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold uppercase flex items-center gap-2">
            <Camera className="w-5 h-5 text-secondary" />
            Photos
          </h2>
          <button
            type="button"
            onClick={() => setShowPhotoUpload(true)}
            className="px-4 py-2 border-4 border-black bg-secondary text-black font-bold uppercase text-sm shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000] transition-all"
          >
            Add Photo
          </button>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-12 border-4 border-dashed border-muted">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No photos yet. Add your first memory!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedPhoto(photo)}
                className="aspect-square relative border-4 border-black overflow-hidden hover:scale-[1.02] transition-transform"
              >
                <Image
                  src={photo.storage_url || "/placeholder.svg"}
                  alt={photo.caption || "Restaurant photo"}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Private Review Section */}
      <div className="border-4 border-accent/50 bg-accent/10 p-6 shadow-[6px_6px_0px_0px_rgba(0,255,255,0.3)] mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold uppercase text-accent">
              Private Review
            </h2>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-accent text-black text-xs font-mono uppercase">
            <Lock className="w-3 h-3" />
            Only You Can See This
          </div>
        </div>

        {isEditingReview ? (
          <div className="space-y-4">
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border-4 border-accent bg-background text-foreground font-mono focus:outline-none focus:ring-4 focus:ring-accent/50 resize-none"
              placeholder="Write your honest thoughts about this restaurant..."
            />
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsEditingReview(false)}
                className="px-4 py-2 border-4 border-black bg-background text-foreground font-bold uppercase text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReview}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 border-4 border-black bg-accent text-black font-bold uppercase text-sm shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000] transition-all disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Review
              </button>
            </div>
          </div>
        ) : (
          <div>
            {review ? (
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground whitespace-pre-wrap font-mono">
                  {review}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                No review written yet.
              </p>
            )}
            <button
              type="button"
              onClick={() => setIsEditingReview(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 border-4 border-accent bg-transparent text-accent font-bold uppercase text-sm hover:bg-accent hover:text-black transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              {review ? "Edit Review" : "Write Review"}
            </button>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="border-4 border-destructive/50 bg-destructive/10 p-6">
        <h2 className="text-xl font-bold uppercase text-destructive mb-4">
          Danger Zone
        </h2>
        <p className="text-muted-foreground mb-4">
          Deleting this restaurant will permanently remove all photos and
          reviews.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 border-4 border-destructive bg-transparent text-destructive font-bold uppercase text-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Restaurant
        </button>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <PhotoUpload
          restaurantId={restaurant.id}
          onClose={() => setShowPhotoUpload(false)}
          onSuccess={handlePhotoUploaded}
        />
      )}

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onDelete={() => handleDeletePhoto(selectedPhoto.id)}
          isPending={isPending}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <DeleteConfirmation
          name={restaurant.name}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteRestaurant}
          isPending={isPending}
        />
      )}
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
        className="fixed inset-0 bg-black/90 z-50"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close lightbox"
      />
      <div className="fixed inset-4 md:inset-8 z-50 flex items-center justify-center">
        <div className="relative max-w-full max-h-full">
          <Image
            src={photo.storage_url || "/placeholder.svg"}
            alt={photo.caption || "Restaurant photo"}
            width={1200}
            height={800}
            className="max-w-full max-h-[80vh] object-contain border-4 border-black"
          />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={onDelete}
              disabled={isPending}
              className="w-10 h-10 border-4 border-black bg-destructive text-black flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 border-4 border-black bg-white text-black flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <X className="w-5 h-5" />
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
        className="fixed inset-0 bg-black/70 z-50"
        onClick={onCancel}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
        role="button"
        tabIndex={0}
        aria-label="Close confirmation"
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border-4 border-black shadow-[8px_8px_0px_0px_#000] z-50 p-6">
        <h3 className="text-xl font-bold uppercase mb-4">Delete Restaurant?</h3>
        <p className="text-muted-foreground mb-6">
          Are you sure you want to delete <strong>{name}</strong>? This action
          cannot be undone.
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 border-4 border-black bg-background text-foreground font-bold uppercase hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-4 border-black bg-destructive text-destructive-foreground font-bold uppercase shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000] transition-all disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </button>
        </div>
      </div>
    </>
  );
}
