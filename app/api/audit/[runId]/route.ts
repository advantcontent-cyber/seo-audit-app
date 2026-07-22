import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: { runId: string } }) {
  const { data, error } = await supabaseServer.from("audit_runs").select("*").eq("id", params.runId).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Run not found" }, { status: 404 });
  return NextResponse.json(data);
}
