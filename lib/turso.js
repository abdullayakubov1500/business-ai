import { createClient } from "@libsql/client";

let client;
let schemaReady;

function missingConfig() {
  const error = new Error("Задайте TURSO_DATABASE_URL и TURSO_AUTH_TOKEN в .env.local");
  error.status = 500;
  return error;
}

export function getTurso() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    throw missingConfig();
  }
  if (!client) {
    client = createClient({ url, authToken });
  }
  return client;
}

export async function ensureLeadsTable() {
  if (schemaReady) {
    return getTurso();
  }
  const db = getTurso();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      site_type TEXT NOT NULL DEFAULT '',
      comment TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'form',
      status TEXT NOT NULL DEFAULT 'new',
      conversation TEXT NOT NULL DEFAULT '[]'
    )
  `);
  await db.execute(
    "CREATE INDEX IF NOT EXISTS leads_phone_created ON leads (phone, created_at)",
  );
  schemaReady = true;
  return db;
}
