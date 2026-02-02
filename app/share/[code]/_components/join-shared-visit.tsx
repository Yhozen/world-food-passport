"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useTRPC } from "@/trpc/client";

interface JoinSharedVisitProps {
  shareCode: string;
}

export function JoinSharedVisit({ shareCode }: JoinSharedVisitProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const trpc = useTRPC();
  const joinSharedVisit = useMutation(trpc.sharedVisits.join.mutationOptions());

  function handleJoin() {
    setError(null);
    startTransition(async () => {
      try {
        await joinSharedVisit.mutateAsync({ shareCode });
        router.refresh();
      } catch (joinError) {
        setError(
          joinError instanceof Error
            ? joinError.message
            : "Unable to join shared visit",
        );
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={handleJoin}
        disabled={isPending}
        className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        Join shared visit
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
