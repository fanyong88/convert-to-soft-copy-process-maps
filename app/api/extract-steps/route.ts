import { NextResponse } from "next/server";
import { extractStepsForMap } from "@/lib/ai/extract";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const mapId = body?.map_id as string | undefined;
  if (!mapId) {
    return NextResponse.json({ ok: false, error: "map_id is required" }, { status: 400 });
  }

  const result = await extractStepsForMap(mapId);
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
