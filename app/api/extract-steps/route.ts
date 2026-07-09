import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractStepsForMap } from "@/lib/ai/extract";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const mapId = body?.map_id as string | undefined;
  if (!mapId) {
    return NextResponse.json({ ok: false, error: "map_id is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 });
  }

  // RLS-scoped select: comes back null if the caller doesn't own this map.
  const { data: map } = await supabase.from("process_maps").select("id").eq("id", mapId).single();
  if (!map) {
    return NextResponse.json({ ok: false, error: "Map not found" }, { status: 404 });
  }

  const result = await extractStepsForMap(mapId);
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
