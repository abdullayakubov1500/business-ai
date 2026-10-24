import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { updateLeadStatus } from "@/lib/leads";

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const lead = await updateLeadStatus(id, body.status);
    return NextResponse.json({ lead });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
