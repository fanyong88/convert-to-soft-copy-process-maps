import { createAdminClient } from "@/lib/supabase/admin";

const SIGNED_URL_TTL_SECONDS = 3600;

export async function getSignedPhotoUrl(photoPath: string | null): Promise<string | null> {
  if (!photoPath) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("map-photos")
    .createSignedUrl(photoPath, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function getSignedPhotoUrls(
  photoPaths: (string | null)[],
): Promise<Map<string, string>> {
  const paths = [...new Set(photoPaths.filter((p): p is string => !!p))];
  if (paths.length === 0) return new Map();

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("map-photos")
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return new Map();

  const map = new Map<string, string>();
  for (const item of data) {
    if (item.path && item.signedUrl) map.set(item.path, item.signedUrl);
  }
  return map;
}
