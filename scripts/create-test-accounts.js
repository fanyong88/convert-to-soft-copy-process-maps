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

  const accounts = [
    { email: "consultant-a@test.local", password: "test-password-A1" },
    { email: "consultant-b@test.local", password: "test-password-B1" },
  ];

  for (const acc of accounts) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: acc.email,
      password: acc.password,
      email_confirm: true,
    });
    if (error && !error.message.includes("already been registered")) {
      console.error(`FAILED for ${acc.email}:`, error.message);
      continue;
    }
    console.log(`${acc.email} -> id=${data?.user?.id ?? "(already existed)"}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
