import { randomUUID } from "crypto";
import { sendTelegramLead } from "./telegram";
import { ensureLeadsTable } from "./turso";

function phoneDigits(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  }
  if (digits.length === 10 && digits.startsWith("9")) {
    digits = `7${digits}`;
  }
  return digits;
}

export function normalizePhone(phone) {
  const digits = phoneDigits(phone);
  return digits ? `+${digits}` : "";
}

export function isValidPhone(phone) {
  const digits = phoneDigits(phone);
  if (digits.startsWith("998")) {
    return digits.length === 12;
  }
  if (digits.startsWith("7")) {
    return digits.length === 11;
  }
  return digits.length >= 10 && digits.length <= 15;
}

function mapLead(row) {
  let conversation = [];
  try {
    conversation = JSON.parse(row.conversation || "[]");
  } catch {
    conversation = [];
  }
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    phone: row.phone,
    siteType: row.site_type,
    comment: row.comment,
    source: row.source,
    status: row.status,
    conversation,
  };
}

export async function listLeads() {
  const db = await ensureLeadsTable();
  const result = await db.execute("SELECT * FROM leads ORDER BY created_at DESC");
  return result.rows.map(mapLead);
}

export async function createLead(input) {
  const name = String(input.name || "").trim();
  const phone = normalizePhone(input.phone);
  const siteType = String(input.siteType || "").trim();
  const comment = String(input.comment || "").trim();
  const source = String(input.source || "form");

  if (!name) {
    const error = new Error("Укажите имя");
    error.status = 400;
    throw error;
  }
  if (!isValidPhone(input.phone)) {
    const error = new Error("Укажите телефон с кодом страны, например +998 90 123-45-67");
    error.status = 400;
    throw error;
  }

  const db = await ensureLeadsTable();
  const since = new Date(Date.now() - 1000 * 60 * 30).toISOString();
  const existing = await db.execute({
    sql: "SELECT * FROM leads WHERE phone = ? AND created_at >= ? ORDER BY created_at DESC LIMIT 1",
    args: [phone, since],
  });
  if (existing.rows[0]) {
    return { lead: mapLead(existing.rows[0]), duplicate: true };
  }

  const lead = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    name,
    phone,
    siteType,
    comment,
    source,
    status: "new",
    conversation: Array.isArray(input.conversation) ? input.conversation : [],
  };

  await db.execute({
    sql: `INSERT INTO leads (id, created_at, name, phone, site_type, comment, source, status, conversation)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      lead.id,
      lead.createdAt,
      lead.name,
      lead.phone,
      lead.siteType,
      lead.comment,
      lead.source,
      lead.status,
      JSON.stringify(lead.conversation),
    ],
  });

  try {
    await sendTelegramLead(lead);
  } catch (error) {
    console.error("Telegram notify failed:", error);
  }

  return { lead, duplicate: false };
}

export async function updateLeadStatus(id, status) {
  const allowed = ["new", "progress", "done"];
  if (!allowed.includes(status)) {
    const error = new Error("Некорректный статус");
    error.status = 400;
    throw error;
  }

  const db = await ensureLeadsTable();
  const current = await db.execute({
    sql: "SELECT * FROM leads WHERE id = ? LIMIT 1",
    args: [id],
  });
  if (!current.rows[0]) {
    const error = new Error("Заявка не найдена");
    error.status = 404;
    throw error;
  }

  await db.execute({
    sql: "UPDATE leads SET status = ? WHERE id = ?",
    args: [status, id],
  });

  return { ...mapLead(current.rows[0]), status };
}
