import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildExcelBuffer } from "@/lib/export/excel";
import type { ProcessStep } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const mapId = body?.map_id as string | undefined;
  if (!mapId) {
    return NextResponse.json({ error: "map_id is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const [{ data: map }, { data: steps }] = await Promise.all([
    supabase.from("process_maps").select("name").eq("id", mapId).single(),
    supabase
      .from("process_steps")
      .select("*")
      .eq("map_id", mapId)
      .order("sequence", { ascending: true }),
  ]);

  if (!steps || steps.length === 0) {
    return NextResponse.json({ error: "Add steps before exporting" }, { status: 400 });
  }

  const buffer = buildExcelBuffer(steps as ProcessStep[]);

  await supabase
    .from("export_logs")
    .insert({ map_id: mapId, export_format: "excel", triggered_by: "anonymous" });

  const safeName = (map?.name ?? "process-map").replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${safeName}.xlsx"`,
    },
  });
}
