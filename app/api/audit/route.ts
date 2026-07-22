import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit";
import { supabaseServer } from "@/lib/supabase";
import { projectKey } from "@/lib/domain";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const domainInput = body?.domain?.trim();

  if (!domainInput) {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }

  try {
    const result = await runAudit(domainInput, process.env.PAGESPEED_API_KEY);
    const key = projectKey(domainInput);

    // Best-effort save — don't fail the request if Supabase isn't configured yet.
    let projectId: string | null = null;
    try {
      const { data: existing } = await supabaseServer.from("projects").select("id").eq("domain", key).maybeSingle();

      if (existing) {
        projectId = existing.id;
      } else {
        const { data: created, error: createError } = await supabaseServer
          .from("projects")
          .insert({ domain: key, name: key })
          .select("id")
          .single();
        if (createError) throw createError;
        projectId = created.id;
      }

      await supabaseServer.from("audit_runs").insert({
        project_id: projectId,
        domain: result.domain,
        pages_checked: result.pagesChecked,
        health_score: result.healthScore,
        summary: result.summary,
        findings: result.findings,
        started_at: result.startedAt,
      });

      await supabaseServer
        .from("projects")
        .update({ latest_health_score: result.healthScore, last_audited_at: result.startedAt })
        .eq("id", projectId);
    } catch (dbError) {
      console.error("Failed to save audit run:", dbError);
    }

    return NextResponse.json({ ...result, projectId });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
