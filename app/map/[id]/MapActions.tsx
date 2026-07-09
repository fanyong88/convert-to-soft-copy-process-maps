"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteMap, markReviewed, markDraft } from "@/lib/actions/maps";
import { ConfirmModal } from "@/app/components/ConfirmModal";
import type { MapStatus } from "@/lib/types";

export function MapActions({
  mapId,
  mapName,
  status,
}: {
  mapId: string;
  mapName: string;
  status: MapStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function onConfirmDelete() {
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
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleReview}
          disabled={isPending}
          className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
        >
          {status === "reviewed" ? "Mark as Draft" : "Mark as Reviewed"}
        </button>
        <button
          onClick={() => setConfirmingDelete(true)}
          disabled={isPending}
          className="inline-flex items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
        >
          Delete Map
        </button>
      </div>
      {confirmingDelete && (
        <ConfirmModal
          title="Delete this map?"
          message={`"${mapName}" and all of its steps will be permanently deleted. This can't be undone.`}
          confirmLabel="Delete Map"
          pending={isPending}
          onConfirm={onConfirmDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </>
  );
}
