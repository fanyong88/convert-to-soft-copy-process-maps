import Link from "next/link";
import { StatusBadge } from "@/app/components/StatusBadge";
import type { ProcessMap } from "@/lib/types";

interface MapCardProps {
  map: ProcessMap;
  photoUrl: string | null;
  stepCount: number;
  lowConfidenceCount: number;
  exportCount: number;
}

export function MapCard({ map, photoUrl, stepCount, lowConfidenceCount, exportCount }: MapCardProps) {
  return (
    <Link
      href={`/map/${map.id}`}
      className="group flex flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
    >
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-neutral-100">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={map.name}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            No photo
          </div>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-neutral-900">{map.name}</h3>
        <StatusBadge status={map.status} />
      </div>
      {map.client_name && (
        <p className="mt-0.5 text-sm text-neutral-500">{map.client_name}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
        <span>{stepCount} step{stepCount === 1 ? "" : "s"}</span>
        {lowConfidenceCount > 0 && (
          <span className="inline-flex items-center gap-1 text-amber-600">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {lowConfidenceCount} to check
          </span>
        )}
        {exportCount > 0 && <span>{exportCount} export{exportCount === 1 ? "" : "s"}</span>}
      </div>
    </Link>
  );
}
