"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractStepsForMap } from "@/lib/ai/extract";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export type CreateMapState = { error: string | null };

export async function createMap(
  _prevState: CreateMapState,
  formData: FormData,
): Promise<CreateMapState> {
  const name = String(formData.get("name") ?? "").trim();
  const clientName = String(formData.get("client_name") ?? "").trim();
  const photo = formData.get("photo") as File | null;

  if (!name) {
    return { error: "Map name is required." };
  }
  if (!photo || photo.size === 0) {
    return { error: "A photo of the flipchart map is required." };
  }
  if (!ALLOWED_TYPES.includes(photo.type)) {
    return { error: "Please upload a JPG, PNG, WEBP, or HEIC image." };
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    return { error: "Photo must be under 10 MB." };
  }

  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to create a map." };
  }

  // Storage writes to the private bucket go through the service-role client;
  // ownership of the DB row (below) is what RLS actually enforces.
  const admin = createAdminClient();
  const ext = photo.name.split(".").pop() || "jpg";
  const path = `${randomUUID()}.${ext}`;
  const { error: uploadError } = await admin.storage
    .from("map-photos")
    .upload(path, await photo.arrayBuffer(), { contentType: photo.type });

  if (uploadError) {
    return { error: `Photo upload failed: ${uploadError.message}` };
  }

  const { data: map, error: insertError } = await session
    .from("process_maps")
    .insert({
      name,
      client_name: clientName || null,
      photo_path: path,
      status: "draft",
      user_id: user.id,
    })
    .select("id")
    .single();

  if (insertError || !map) {
    return { error: `Could not save map: ${insertError?.message ?? "unknown error"}` };
  }

  // Extraction is an accelerator, not a hard dependency (see docs/ARCHITECTURE.md
  // "Core Without AI") — run it after the response so upload stays fast, and let
  // the map detail page poll for steps while this is in flight.
  after(() => extractStepsForMap(map.id));

  revalidatePath("/");
  redirect(`/map/${map.id}`);
}

export async function deleteMap(mapId: string): Promise<void> {
  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();

  // RLS scopes this select to rows the caller owns (or legacy user_id IS
  // NULL rows) — if they don't own it, this comes back null and nothing
  // downstream can touch it.
  const { data: map } = await session
    .from("process_maps")
    .select("name, photo_path")
    .eq("id", mapId)
    .single();

  if (!map) return;

  // Human-only, always-confirmed action (docs/AGENTIC_LAYER.md) — audit trail
  // lives in Vercel function logs since v1 has no dedicated audit table.
  console.log(`[audit] deleteMap: id=${mapId} name=${JSON.stringify(map.name)} triggered_by=${user?.email ?? "unknown"} at=${new Date().toISOString()}`);

  if (map.photo_path) {
    const admin = createAdminClient();
    await admin.storage.from("map-photos").remove([map.photo_path]);
  }

  await session.from("process_maps").delete().eq("id", mapId);
  revalidatePath("/");
}

export async function markReviewed(mapId: string): Promise<void> {
  const session = await createClient();
  await session.from("process_maps").update({ status: "reviewed" }).eq("id", mapId);
  revalidatePath(`/map/${mapId}`);
  revalidatePath("/");
}

export async function markDraft(mapId: string): Promise<void> {
  const session = await createClient();
  await session.from("process_maps").update({ status: "draft" }).eq("id", mapId);
  revalidatePath(`/map/${mapId}`);
  revalidatePath("/");
}
