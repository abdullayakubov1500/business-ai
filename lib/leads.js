import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { sendTelegramLead } from "./telegram";

const FILE = path.join(process.cwd(), "data", "leads.json");

async function ensureFile() {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  try {
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, "[]", "utf8");
  }
}

export async function listLeads() {
  await ensureFile();
  const raw = await fs.readFile(FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLeads(leads) {
  await ensureFile();
  await fs.writeFile(FILE, JSON.stringify(leads, null, 2), "utf8");
}

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

  const leads = await listLeads();
  const duplicate = leads.find(
    (lead) =>
      lead.phone === phone && Date.now() - new Date(lead.createdAt).getTime() < 1000 * 60 * 30,
  );
  if (duplicate) {
    return { lead: duplicate, duplicate: true };
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

  leads.unshift(lead);
  await writeLeads(leads);

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

  const leads = await listLeads();
  const index = leads.findIndex((lead) => lead.id === id);
  if (index === -1) {
    const error = new Error("Заявка не найдена");
    error.status = 404;
    throw error;
  }

  leads[index] = { ...leads[index], status };
  await writeLeads(leads);
  return leads[index];
}
