const fs = require("fs");
const { randomUUID } = require("crypto");
const { createClient } = require("@supabase/supabase-js");

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (m) process.env[m[1]] = m[2];
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const photoBuf = fs.readFileSync(process.argv[2]);
  const path = `${randomUUID()}.jpg`;
  await supabase.storage.from("map-photos").upload(path, photoBuf, { contentType: "image/jpeg" });
  const { data: pub } = supabase.storage.from("map-photos").getPublicUrl(path);

  const { data: map } = await supabase
    .from("process_maps")
    .insert({ name: "__TEST__ Extraction Check", client_name: "Test Co", photo_url: pub.publicUrl, status: "draft" })
    .select("*")
    .single();
  console.log("Created test map:", map.id, pub.publicUrl);

  const res = await fetch("http://localhost:3000/api/extract-steps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ map_id: map.id }),
  });
  const json = await res.json();
  console.log("extract-steps response:", res.status, JSON.stringify(json));

  const { data: steps } = await supabase
    .from("process_steps")
    .select("*")
    .eq("map_id", map.id)
    .order("sequence");
  console.log("Steps in DB:", steps.length);
  for (const s of steps ?? []) {
    console.log(" -", s.sequence, s.label, s.step_type, s.label_confidence, s.label_review_status);
  }

  console.log("\nTest map id (for manual UI check, then cleanup):", map.id);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
