import { NextResponse } from "next/server";
import { chatWithStudio } from "@/lib/gemini";

export async function POST(request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const result = await chatWithStudio(messages);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "ИИ сейчас недоступен. Оставьте бриф в форме ниже." },
      { status: 500 },
    );
  }
}
