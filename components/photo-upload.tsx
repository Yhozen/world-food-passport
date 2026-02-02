"use client";

import React from "react";

import { useState, useRef, useTransition } from "react";
import { X, Upload, Loader2, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white/95 p-0 shadow-lg sm:max-w-xl">
        <DialogHeader className="border-b border-slate-200 bg-white/80 px-6 py-5">
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Upload photo
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Add a memory to this visit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-6">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onKeyDown={(e) =>
              e.key === "Enter" && fileInputRef.current?.click()
            }
            role="button"
            tabIndex={0}
            className={`group relative cursor-pointer rounded-2xl border border-dashed px-6 py-8 transition ${
              preview
                ? "border-slate-200 bg-white"
                : "border-slate-200 bg-slate-50/80 hover:border-slate-300"
            }`}
          >
            {preview ? (
              <div className="relative overflow-hidden rounded-2xl bg-slate-50">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={preview || "/placeholder.svg"}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(null);
                    setFile(null);
                  }}
                  className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                  <ImageIcon className="h-7 w-7" />
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  Drop your photo here
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  or click to browse
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Max 10MB, JPG/PNG/WEBP
                </p>
              </div>
            )}

            {file && (
              <p className="mt-4 text-xs text-slate-500">
                Selected: {file.name} · {formatFileSize(file.size)}
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div>
            <label
              htmlFor="caption"
              className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
            >
              Caption (optional)
            </label>
            <input
              type="text"
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              placeholder="Add a caption..."
            />
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
              type="button"
              onClick={handleSubmit}
              disabled={!file || isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}
