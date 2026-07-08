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

  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw listErr;

  if (buckets.some((b) => b.name === "map-photos")) {
    console.log("Bucket map-photos already exists");
    return;
  }

  const { error } = await supabase.storage.createBucket("map-photos", {
    public: true,
    fileSizeLimit: "10MB",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
  });
  if (error) throw error;
  console.log("Created bucket map-photos");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
