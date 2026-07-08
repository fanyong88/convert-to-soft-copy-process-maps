"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const supabase = createAdminClient();

  const ext = photo.name.split(".").pop() || "jpg";
  const path = `${randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("map-photos")
    .upload(path, await photo.arrayBuffer(), { contentType: photo.type });

  if (uploadError) {
    return { error: `Photo upload failed: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("map-photos").getPublicUrl(path);

  const { data: map, error: insertError } = await supabase
    .from("process_maps")
    .insert({
      name,
      client_name: clientName || null,
      photo_url: publicUrl,
      status: "draft",
    })
    .select("id")
    .single();

  if (insertError || !map) {
    return { error: `Could not save map: ${insertError?.message ?? "unknown error"}` };
  }

  revalidatePath("/");
  redirect(`/map/${map.id}`);
}

export async function deleteMap(mapId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: map } = await supabase
    .from("process_maps")
    .select("photo_url")
    .eq("id", mapId)
    .single();

  if (map?.photo_url) {
    const path = map.photo_url.split("/map-photos/")[1];
    if (path) {
      await supabase.storage.from("map-photos").remove([path]);
    }
  }

  await supabase.from("process_maps").delete().eq("id", mapId);
  revalidatePath("/");
}

export async function markReviewed(mapId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("process_maps").update({ status: "reviewed" }).eq("id", mapId);
  revalidatePath(`/map/${mapId}`);
  revalidatePath("/");
}

export async function markDraft(mapId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("process_maps").update({ status: "draft" }).eq("id", mapId);
  revalidatePath(`/map/${mapId}`);
  revalidatePath("/");
}
