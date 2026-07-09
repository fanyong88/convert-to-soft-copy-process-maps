const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (m) process.env[m[1]] = m[2];
}

async function main() {
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: map } = await admin
    .from("process_maps")
    .select("photo_path")
    .eq("id", "0ad7f3f9-40eb-4d26-96ce-d379ea3c3305")
    .single();
  const path = map.photo_path;
  console.log("Testing with photo_path:", path);

  // 1. Old-style public URL should now be blocked (bucket is private).
  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/map-photos/${path}`;
  const publicRes = await fetch(publicUrl);
  console.log("Public URL fetch status ->", publicRes.status, publicRes.status === 400 || publicRes.status === 403 || publicRes.status === 404 ? "(blocked, ok)" : "(UNEXPECTED - may still be accessible)");

  // 2. Short-lived signed URL should work immediately...
  const { data: signed } = await admin.storage.from("map-photos").createSignedUrl(path, 2);
  const immediateRes = await fetch(signed.signedUrl);
  console.log("Signed URL immediate fetch status ->", immediateRes.status, immediateRes.status === 200 ? "(ok)" : "(FAIL)");

  // 3. ...and fail after it expires.
  await new Promise((r) => setTimeout(r, 4000));
  const expiredRes = await fetch(signed.signedUrl);
  console.log("Signed URL after expiry fetch status ->", expiredRes.status, expiredRes.status !== 200 ? "(expired, ok)" : "(BUG: still works)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
