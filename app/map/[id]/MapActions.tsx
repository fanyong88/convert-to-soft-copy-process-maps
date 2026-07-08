"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteMap, markReviewed, markDraft } from "@/lib/actions/maps";
import type { MapStatus } from "@/lib/types";

export function MapActions({ mapId, status }: { mapId: string; status: MapStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm("Delete this map and all its steps? This can't be undone.")) return;
    startTransition(async () => {
      await deleteMap(mapId);
      router.push("/");
    });
  }

  function onToggleReview() {
    startTransition(async () => {
      if (status === "reviewed") {
        await markDraft(mapId);
      } else {
        await markReviewed(mapId);
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleReview}
        disabled={isPending}
        className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
      >
        {status === "reviewed" ? "Mark as Draft" : "Mark as Reviewed"}
      </button>
      <button
        onClick={onDelete}
        disabled={isPending}
        className="inline-flex items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
      >
        Delete Map
      </button>
    </div>
  );
}
