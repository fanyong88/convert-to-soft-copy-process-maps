import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MapCard } from "@/app/components/MapCard";
import type { ProcessMap, ProcessStep, ExportLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  const [mapsRes, stepsRes, logsRes] = await Promise.all([
    supabase.from("process_maps").select("*").order("created_at", { ascending: false }),
    supabase.from("process_steps").select("map_id, label_confidence, label_review_status"),
    supabase.from("export_logs").select("map_id"),
  ]);

  if (mapsRes.error) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <h2 className="font-semibold">Couldn&apos;t load process maps</h2>
          <p className="mt-1 text-sm">{mapsRes.error.message}</p>
        </div>
      </main>
    );
  }

  const maps = (mapsRes.data ?? []) as ProcessMap[];
  const steps = (stepsRes.data ?? []) as Pick<
    ProcessStep,
    "map_id" | "label_confidence" | "label_review_status"
  >[];
  const logs = (logsRes.data ?? []) as Pick<ExportLog, "map_id">[];

  const stepCountByMap = new Map<string, number>();
  const lowConfByMap = new Map<string, number>();
  for (const s of steps) {
    stepCountByMap.set(s.map_id, (stepCountByMap.get(s.map_id) ?? 0) + 1);
    if (
      s.label_confidence !== null &&
      s.label_confidence < 0.85 &&
      s.label_review_status === "unreviewed"
    ) {
      lowConfByMap.set(s.map_id, (lowConfByMap.get(s.map_id) ?? 0) + 1);
    }
  }
  const exportCountByMap = new Map<string, number>();
  for (const l of logs) {
    exportCountByMap.set(l.map_id, (exportCountByMap.get(l.map_id) ?? 0) + 1);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Process Maps
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Photograph a flipchart, get an editable workflow file in minutes.
          </p>
        </div>
        <Link
          href="/new"
          className="inline-flex shrink-0 items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
        >
          New Map
        </Link>
      </div>

      {maps.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 py-20 text-center">
          <p className="text-neutral-600">No maps yet — upload your first flipchart.</p>
          <Link
            href="/new"
            className="mt-4 inline-flex items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
          >
            New Map
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {maps.map((map) => (
            <MapCard
              key={map.id}
              map={map}
              stepCount={stepCountByMap.get(map.id) ?? 0}
              lowConfidenceCount={lowConfByMap.get(map.id) ?? 0}
              exportCount={exportCountByMap.get(map.id) ?? 0}
            />
          ))}
        </div>
      )}
    </main>
  );
}
