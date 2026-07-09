import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/app/components/StatusBadge";
import { MapActions } from "@/app/map/[id]/MapActions";
import { StepsPanel } from "@/app/map/[id]/StepsPanel";
import { ExportButtons } from "@/app/map/[id]/ExportButtons";
import type { ProcessMap, ProcessStep } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MapDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [mapRes, stepsRes] = await Promise.all([
    supabase.from("process_maps").select("*").eq("id", id).single(),
    supabase
      .from("process_steps")
      .select("*")
      .eq("map_id", id)
      .order("sequence", { ascending: true }),
  ]);

  if (mapRes.error || !mapRes.data) {
    notFound();
  }

  const map = mapRes.data as ProcessMap;
  const steps = (stepsRes.data ?? []) as ProcessStep[];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-700">
        ← All maps
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{map.name}</h1>
            <StatusBadge status={map.status} />
          </div>
          {map.client_name && <p className="mt-1 text-sm text-neutral-500">{map.client_name}</p>}
        </div>
        <div className="flex flex-col items-end gap-3">
          <MapActions mapId={map.id} mapName={map.name} status={map.status} />
          <ExportButtons mapId={map.id} stepCount={steps.length} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-neutral-700">Original Photo</h2>
          <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
            {map.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={map.photo_url} alt={map.name} className="w-full object-contain" />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-neutral-400">
                No photo
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-neutral-700">Process Steps</h2>
          <StepsPanel mapId={map.id} steps={steps} mapCreatedAt={map.created_at} />
        </div>
      </div>
    </main>
  );
}
