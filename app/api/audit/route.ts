import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit";
import { supabaseServer } from "@/lib/supabase";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const domain = body?.domain?.trim();

  if (!domain) {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }

  try {
    const result = await runAudit(domain, process.env.PAGESPEED_API_KEY);

    // Best-effort save — don't fail the request if Supabase isn't configured yet.
    try {
      await supabaseServer.from("audit_runs").insert({
        domain: result.domain,
        pages_checked: result.pagesChecked,
        summary: result.summary,
        findings: result.findings,
        started_at: result.startedAt,
      });
    } catch (dbError) {
      console.error("Failed to save audit run:", dbError);
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
