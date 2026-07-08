const fs = require("fs");
const { Client } = require("pg");

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (m) process.env[m[1]] = m[2];
}

async function main() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING.replace(
    /[?&]sslmode=[^&]*/,
    "",
  );
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const maps = await client.query("select count(*) from process_maps");
    const steps = await client.query("select count(*) from process_steps");
    const logs = await client.query("select count(*) from export_logs");
    console.log("process_maps:", maps.rows[0].count);
    console.log("process_steps:", steps.rows[0].count);
    console.log("export_logs:", logs.rows[0].count);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
