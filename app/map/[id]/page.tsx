import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/app/components/StatusBadge";
import { MapActions } from "@/app/map/[id]/MapActions";
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
        <MapActions mapId={map.id} status={map.status} />
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
          {steps.length === 0 ? (
            <div className="mt-2 rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
              No steps yet.
            </div>
          ) : (
            <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200">
              <table className="min-w-full divide-y divide-neutral-200 text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-neutral-500">#</th>
                    <th className="px-3 py-2 text-left font-medium text-neutral-500">Label</th>
                    <th className="px-3 py-2 text-left font-medium text-neutral-500">Type</th>
                    <th className="px-3 py-2 text-left font-medium text-neutral-500">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {steps.map((step) => (
                    <tr key={step.id}>
                      <td className="px-3 py-2 text-neutral-500">{step.sequence}</td>
                      <td className="px-3 py-2 font-medium text-neutral-900">{step.label}</td>
                      <td className="px-3 py-2 capitalize text-neutral-600">{step.step_type}</td>
                      <td className="px-3 py-2 text-neutral-500">
                        {step.label_confidence !== null
                          ? `${Math.round(step.label_confidence * 100)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
