"use client";

import React from "react";

import { useState, useRef, useTransition } from "react";
import { X, Upload, Loader2, ImageIcon } from "lucide-react";
import { uploadPhoto } from "@/lib/actions";
import Image from "next/image";

interface PhotoUploadProps {
  restaurantId: string;
  onClose: () => void;
  onSuccess: (url: string) => void;
}

export function PhotoUpload({
  restaurantId,
  onClose,
  onSuccess,
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("Image must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.type.startsWith("image/")) {
        setError("Please drop an image file");
        return;
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError("Image must be less than 10MB");
        return;
      }
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("restaurant_id", restaurantId);
    formData.append("file", file);
    if (caption) {
      formData.append("caption", caption);
    }

    startTransition(async () => {
      const result = await uploadPhoto(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.url) {
        onSuccess(result.url);
      }
    });
  };

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
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-card border-4 border-black shadow-[8px_8px_0px_0px_#000] z-50 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b-4 border-black p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold uppercase">Upload Photo</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 border-4 border-black bg-background flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 border-4 border-black bg-destructive text-destructive-foreground font-bold">
              {error}
            </div>
          )}

          {/* Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onKeyDown={(e) =>
              e.key === "Enter" && fileInputRef.current?.click()
            }
            role="button"
            tabIndex={0}
            className={`
              relative border-4 border-dashed cursor-pointer transition-colors
              ${preview ? "border-primary" : "border-muted hover:border-primary"}
            `}
          >
            {preview ? (
              <div className="relative aspect-video">
                <Image
                  src={preview || "/placeholder.svg"}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(null);
                    setFile(null);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 border-4 border-black bg-white text-black flex items-center justify-center hover:bg-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="py-12 text-center">
                <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="font-bold uppercase mb-2">Drop your photo here</p>
                <p className="text-sm text-muted-foreground font-mono">
                  or click to browse
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-2">
                  Max 10MB, JPG/PNG/WEBP
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Caption */}
          <div>
            <label
              htmlFor="caption"
              className="block text-sm font-bold uppercase mb-2"
            >
              Caption (Optional)
            </label>
            <input
              type="text"
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-3 border-4 border-black bg-background text-foreground font-mono focus:outline-none focus:ring-4 focus:ring-secondary/50"
              placeholder="Add a caption..."
            />
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
              type="button"
              onClick={handleSubmit}
              disabled={!file || isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-4 border-black bg-secondary text-black font-bold uppercase shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
