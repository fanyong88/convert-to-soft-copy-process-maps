import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildDrawioXml } from "@/lib/export/drawio";
import type { ProcessStep } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const mapId = body?.map_id as string | undefined;
  if (!mapId) {
    return NextResponse.json({ error: "map_id is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  // RLS scopes both reads to maps/steps the caller owns (or legacy rows).
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

  const xml = buildDrawioXml(steps as ProcessStep[]);

  await supabase.from("export_logs").insert({
    map_id: mapId,
    export_format: "drawio_xml",
    triggered_by: user.email ?? user.id,
    user_id: user.id,
  });

  const safeName = (map?.name ?? "process-map").replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Content-Disposition": `attachment; filename="${safeName}.drawio.xml"`,
    },
  });
}
