"use client";

import { useRef, useState } from "react";

async function downloadFrom(url: string, mapId: string, fallbackName: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ map_id: mapId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Export failed");
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? fallbackName;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

export function ExportButtons({ mapId, stepCount }: { mapId: string; stepCount: number }) {
  const [pending, setPending] = useState<"excel" | "drawio" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const disabled = stepCount === 0;
  // Synchronous lock: guards against a rapid double-click firing two
  // requests before React commits the `pending` state from the first click.
  const inFlight = useRef(false);

  async function onExport(kind: "excel" | "drawio") {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(kind);
    setError(null);
    try {
      if (kind === "excel") {
        await downloadFrom("/api/export/excel", mapId, "process-map.xlsx");
      } else {
        await downloadFrom("/api/export/drawio", mapId, "process-map.drawio.xml");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      inFlight.current = false;
      setPending(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onExport("excel")}
          disabled={disabled || pending !== null}
          title={disabled ? "Add steps before exporting" : undefined}
          className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending === "excel" ? "Exporting…" : "Export → Excel"}
        </button>
        <button
          onClick={() => onExport("drawio")}
          disabled={disabled || pending !== null}
          title={disabled ? "Add steps before exporting" : undefined}
          className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending === "drawio" ? "Exporting…" : "Export → DrawIO XML"}
        </button>
      </div>
      {disabled && (
        <p className="mt-1 text-xs text-neutral-400">Add steps before exporting.</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
