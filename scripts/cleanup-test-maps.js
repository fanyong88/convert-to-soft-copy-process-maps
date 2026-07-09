const fs = require("fs");
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

  const { data: maps } = await supabase
    .from("process_maps")
    .select("id, name, photo_url")
    .like("name", "__TEST__%");

  for (const m of maps ?? []) {
    if (m.photo_url) {
      const path = m.photo_url.split("/map-photos/")[1];
      if (path) await supabase.storage.from("map-photos").remove([path]);
    }
    await supabase.from("process_maps").delete().eq("id", m.id);
    console.log("Deleted", m.id, m.name);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
