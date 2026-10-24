import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "pole_admin";
const WEEK = 60 * 60 * 24 * 7;

function secret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "dev-secret";
}

function sign(payload) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function equal(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export function createSessionToken() {
  const exp = Date.now() + WEEK * 1000;
  const payload = String(exp);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!token || !token.includes(".")) {
    return false;
  }
  const [payload, signature] = token.split(".");
  const exp = Number(payload);
  if (!exp || Date.now() > exp) {
    return false;
  }
  return equal(signature, sign(payload));
}

export function checkPassword(password) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return false;
  }
  return equal(password, expected);
}

export async function getAdminSession() {
  const jar = await cookies();
  return verifySessionToken(jar.get(COOKIE)?.value);
}

export async function setAdminCookie() {
  const jar = await cookies();
  jar.set(COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: WEEK,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function requireAdmin() {
  const ok = await getAdminSession();
  if (!ok) {
    const error = new Error("Нужна авторизация");
    error.status = 401;
    throw error;
  }
}
