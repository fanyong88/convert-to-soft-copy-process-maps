const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (m) process.env[m[1]] = m[2];
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node scripts/run-migration.js <path-to-sql>");
    process.exit(1);
  }
  const sql = fs.readFileSync(path.resolve(file), "utf8");
  const connectionString = process.env.POSTGRES_URL_NON_POOLING.replace(
    /[?&]sslmode=[^&]*/,
    "",
  );
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    console.log(`Applied ${file}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
