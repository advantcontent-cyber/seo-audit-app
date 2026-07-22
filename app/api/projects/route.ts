import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { projectKey } from "@/lib/domain";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("projects")
    .select("*")
    .order("last_audited_at", { ascending: false, nullsFirst: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const domainInput = body?.domain?.trim();
  const name = body?.name?.trim();

  if (!domainInput) {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }

  const key = projectKey(domainInput);

  const { data: existing, error: lookupError } = await supabaseServer
    .from("projects")
    .select("*")
    .eq("domain", key)
    .maybeSingle();
  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 });
  if (existing) return NextResponse.json(existing);

  const { data, error } = await supabaseServer
    .from("projects")
    .insert({ domain: key, name: name || key })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
