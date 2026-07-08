import { createClient } from "@supabase/supabase-js";

// Service-role client for server-only writes (storage uploads, inserts) that
// must succeed before per-user auth exists. Never import this from client code.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
