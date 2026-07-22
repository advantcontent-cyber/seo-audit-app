import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { runAudit } from "@/lib/audit";
import { supabaseServer } from "@/lib/supabase";
import { normalizeDomain } from "@/lib/domain";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const domainInput = body?.domain?.trim();
  const projectId = body?.projectId?.trim();

  if (!domainInput) {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const { data: placeholder, error: insertError } = await supabaseServer
    .from("audit_runs")
    .insert({
      project_id: projectId,
      domain: normalizeDomain(domainInput),
      status: "running",
      current_step: "Starting…",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError || !placeholder) {
    return NextResponse.json({ error: insertError?.message || "Could not start audit" }, { status: 500 });
  }

  const runId = placeholder.id as string;

  // Runs after the response is sent — the crawl keeps going even if the
  // client navigates away; progress/result land in Supabase for polling.
  waitUntil(
    (async () => {
      try {
        const result = await runAudit(domainInput, process.env.PAGESPEED_API_KEY, async (step) => {
          await supabaseServer.from("audit_runs").update({ current_step: step }).eq("id", runId);
        });

        await supabaseServer
          .from("audit_runs")
          .update({
            status: "complete",
            current_step: null,
            domain: result.domain,
            pages_checked: result.pagesChecked,
            health_score: result.healthScore,
            summary: result.summary,
            findings: result.findings,
          })
          .eq("id", runId);

        await supabaseServer
          .from("projects")
          .update({ latest_health_score: result.healthScore, last_audited_at: result.startedAt })
          .eq("id", projectId);
      } catch (e) {
        console.error("Audit run failed:", e);
        await supabaseServer
          .from("audit_runs")
          .update({ status: "error", current_step: (e as Error).message })
          .eq("id", runId);
      }
    })()
  );

  return NextResponse.json({ runId });
}
