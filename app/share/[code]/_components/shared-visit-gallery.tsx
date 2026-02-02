"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import type { Photo } from "@/lib/types";
import { PhotoUpload } from "@/components/photo-upload";

interface SharedVisitGalleryProps {
  restaurantId: string;
  initialPhotos: Photo[];
}

export function SharedVisitGallery({
  restaurantId,
  initialPhotos,
}: SharedVisitGalleryProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [showUpload, setShowUpload] = useState(false);

  const handlePhotoUploaded = (url: string) => {
    setPhotos([
      { id: Date.now().toString(), storageUrl: url, caption: null } as Photo,
      ...photos,
    ]);
    setShowUpload(false);
  };

  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Shared Photos</h2>
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Add Photo
        </button>
      </div>

      {photos.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white/60 py-12 text-center">
          <Camera className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 text-sm text-slate-600">
            No shared photos yet. Add the first memory.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <Image
                src={photo.storageUrl || "/placeholder.svg"}
                alt={photo.caption || "Shared visit photo"}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <PhotoUpload
          restaurantId={restaurantId}
          onClose={() => setShowUpload(false)}
          onSuccess={handlePhotoUploaded}
        />
      )}
    </div>
  );
}
