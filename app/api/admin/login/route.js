import { NextResponse } from "next/server";
import { checkPassword, setAdminCookie } from "@/lib/adminAuth";

export async function POST(request) {
  try {
    const body = await request.json();
    if (!checkPassword(body.password)) {
      return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
    }
    await setAdminCookie();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Ошибка входа" }, { status: 500 });
  }
}
