"use client";

import { useMutation } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import { Check, Copy, Link2, Loader2 } from "lucide-react";
import { useTRPC } from "@/trpc/client";

interface SharedVisitLinkProps {
  restaurantId: string;
}

export function SharedVisitLink({ restaurantId }: SharedVisitLinkProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const trpc = useTRPC();
  const createSharedVisitLink = useMutation(
    trpc.sharedVisits.createLink.mutationOptions(),
  );

  const handleCreateLink = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createSharedVisitLink.mutateAsync({
          restaurantId,
        });
        if ("error" in result) {
          setError(result.error);
          return;
        }

        const url = `${window.location.origin}/share/${result.shareCode}`;
        setShareUrl(url);
        setIsCopied(false);
        try {
          await navigator.clipboard.writeText(url);
          setIsCopied(true);
        } catch {
          setIsCopied(false);
        }
      } catch (createError) {
        setError(
          createError instanceof Error
            ? createError.message
            : "Unable to create share link",
        );
      }
    });
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={handleCreateLink}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
        Share visit
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {shareUrl && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          <span className="max-w-[220px] truncate">{shareUrl}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 transition hover:border-slate-300"
          >
            {isCopied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
