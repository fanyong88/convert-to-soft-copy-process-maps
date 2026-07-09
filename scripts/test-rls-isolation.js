const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (m) process.env[m[1]] = m[2];
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function signIn(email, password) {
  const client = createClient(URL, ANON);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign in failed for ${email}: ${error.message}`);
  return { client, userId: data.user.id };
}

async function main() {
  const a = await signIn("consultant-a@test.local", "test-password-A1");
  const b = await signIn("consultant-b@test.local", "test-password-B1");
  console.log("Consultant A id:", a.userId);
  console.log("Consultant B id:", b.userId);

  // 1. Consultant A creates a map owned by themself.
  const { data: mapA, error: insertErrA } = await a.client
    .from("process_maps")
    .insert({ name: "__TEST__ A-owned map", status: "draft", user_id: a.userId })
    .select("id")
    .single();
  if (insertErrA) throw new Error("A insert failed: " + insertErrA.message);
  console.log("A created map:", mapA.id);

  // 2. Consultant A tries to insert a map claiming to be owned by B (should fail RLS check).
  const { error: spoofErr } = await a.client
    .from("process_maps")
    .insert({ name: "__TEST__ spoofed map", status: "draft", user_id: b.userId });
  console.log(
    "A attempting to insert as B -> ",
    spoofErr ? `BLOCKED (${spoofErr.message})` : "NOT BLOCKED (BUG)",
  );

  // 3. Consultant B tries to read A's map by id (should return null / not found).
  const { data: bSeesA, error: bReadErr } = await b.client
    .from("process_maps")
    .select("id, name")
    .eq("id", mapA.id)
    .maybeSingle();
  console.log(
    "B reading A's map by id -> ",
    bSeesA ? `LEAKED: ${JSON.stringify(bSeesA)} (BUG)` : `hidden (ok)${bReadErr ? " err=" + bReadErr.message : ""}`,
  );

  // 4. Consultant B lists all maps visible to them — should include legacy (user_id null)
  //    maps but NOT A's new map.
  const { data: bList } = await b.client.from("process_maps").select("id, name, user_id");
  const bSeesALeaked = bList.some((m) => m.id === mapA.id);
  const bSeesLegacy = bList.some((m) => m.user_id === null);
  console.log("B's visible map count:", bList.length);
  console.log("B sees A's new map in list ->", bSeesALeaked ? "LEAKED (BUG)" : "not visible (ok)");
  console.log("B sees legacy (user_id null) maps ->", bSeesLegacy ? "yes (expected)" : "no (unexpected)");

  // 5. Consultant B tries to delete A's map directly (should affect 0 rows).
  const { data: bDeleteAttempt } = await b.client
    .from("process_maps")
    .delete()
    .eq("id", mapA.id)
    .select("id");
  console.log(
    "B attempting to delete A's map -> ",
    bDeleteAttempt && bDeleteAttempt.length > 0 ? "DELETED (BUG)" : "blocked (ok)",
  );

  // 6. Confirm A can still see and delete their own map (cleanup).
  const { data: aOwn } = await a.client.from("process_maps").select("id").eq("id", mapA.id).maybeSingle();
  console.log("A can still see own map ->", aOwn ? "yes (ok)" : "NO (BUG)");

  const { error: cleanupErr } = await a.client.from("process_maps").delete().eq("id", mapA.id);
  console.log("Cleanup (A deletes own map) ->", cleanupErr ? `FAILED: ${cleanupErr.message}` : "ok");
}

main().catch((err) => {
  console.error("SCRIPT FAILED:", err);
  process.exit(1);
});
