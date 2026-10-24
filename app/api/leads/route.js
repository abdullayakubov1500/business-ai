import { NextResponse } from "next/server";
import { createLead } from "@/lib/leads";

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Некорректные данные заявки" },
        { status: 400 },
      );
    }
    const { lead, duplicate } = await createLead({
      name: body.name,
      phone: body.phone,
      siteType: body.siteType,
      comment: body.comment,
      source: body.source || "form",
      conversation: body.conversation,
    });

    return NextResponse.json({
      ok: true,
      duplicate,
      id: lead.id,
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { ok: false, error: error.message || "Не удалось сохранить заявку" },
      { status },
    );
  }
}
