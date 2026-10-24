import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { listLeads } from "@/lib/leads";

export async function GET() {
  try {
    await requireAdmin();
    const leads = await listLeads();
    return NextResponse.json({ leads });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
