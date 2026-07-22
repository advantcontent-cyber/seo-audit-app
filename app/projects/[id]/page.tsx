import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import type { Finding, Severity } from "@/lib/audit-types";
import SiteHealthGauge from "@/components/SiteHealthGauge";

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "#d03b3b",
  high: "#ec835a",
  medium: "#fab219",
  low: "#898781",
};

function StatTile({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex-1 rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}

function PillarIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d={path} />
    </svg>
  );
}

function PillarCard({
  href,
  title,
  value,
  sub,
  from,
  to,
  iconPath,
}: {
  href: string;
  title: string;
  value: string;
  sub: string;
  from: string;
  to: string;
  iconPath: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl p-4 text-white shadow-sm transition-transform hover:scale-[1.02]"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
        <PillarIcon path={iconPath} />
      </span>
      <div className="mt-3 text-sm font-medium text-white/80">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
      <div className="mt-0.5 text-xs text-white/70">{sub}</div>
    </Link>
  );
}

export default async function ProjectOverview({ params }: { params: { id: string } }) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [{ data: latestRun }, { data: monthRuns }] = await Promise.all([
    supabaseServer
      .from("audit_runs")
      .select("*")
      .eq("project_id", params.id)
      .eq("status", "complete")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseServer
      .from("audit_runs")
      .select("health_score")
      .eq("project_id", params.id)
      .eq("status", "complete")
      .gte("created_at", startOfMonth.toISOString()),
  ]);

  const topFindings: Finding[] = (latestRun?.findings ?? []).slice(0, 5);
  const monthCount = monthRuns?.length ?? 0;
  const monthAvgScore =
    monthCount > 0 ? Math.round(monthRuns!.reduce((sum, r) => sum + (r.health_score ?? 0), 0) / monthCount) : null;
  const monthLabel = startOfMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-surface px-4 py-3">
        <span className="text-sm font-medium text-ink">This Month — {monthLabel}</span>
        <span className="text-sm text-ink-secondary">
          {monthCount} audit{monthCount === 1 ? "" : "s"} run
          {monthAvgScore !== null && <> · Avg health score {monthAvgScore}</>}
        </span>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {latestRun ? (
          <SiteHealthGauge score={latestRun.health_score} />
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface p-6 text-center lg:w-[152px]">
            <span className="text-sm text-ink-muted">No audits yet</span>
            <Link href={`/projects/${params.id}/seo/audit`} className="text-sm font-medium text-brand hover:underline">
              Run first audit →
            </Link>
          </div>
        )}
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Critical" value={latestRun?.summary?.critical ?? "–"} color={SEVERITY_COLOR.critical} />
          <StatTile label="High" value={latestRun?.summary?.high ?? "–"} color={SEVERITY_COLOR.high} />
          <StatTile label="Pages Checked" value={latestRun?.pages_checked ?? "–"} color="#2a78d6" />
          <StatTile
            label="Last Audited"
            value={latestRun ? new Date(latestRun.created_at).toLocaleDateString() : "–"}
            color="#898781"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <PillarCard
          href={`/projects/${params.id}/seo`}
          title="SEO"
          value={latestRun ? `${latestRun.health_score} / 100` : "Not started"}
          sub="Site audit, keywords, GEO, reporting"
          from="#1baf7a"
          to="#0ca30c"
          iconPath="M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z"
        />
        <PillarCard
          href={`/projects/${params.id}/sem`}
          title="SEM"
          value="Not started"
          sub="Dummy data — coming soon"
          from="#3987e5"
          to="#2a78d6"
          iconPath="M3 12h4l3 8 4-16 3 8h4"
        />
        <PillarCard
          href={`/projects/${params.id}/social`}
          title="Social Media"
          value="Not started"
          sub="Dummy data — coming soon"
          from="#ec835a"
          to="#d03b3b"
          iconPath="M17 2l4 4-4 4M21 6H9a4 4 0 0 0-4 4v1M7 22l-4-4 4-4M3 18h12a4 4 0 0 0 4-4v-1"
        />
      </div>

      {latestRun && (
        <div className="rounded-2xl border border-line bg-surface">
          <div className="border-b border-line px-4 py-3 text-sm font-medium text-ink">Recent Findings (SEO)</div>
          <div className="divide-y divide-line">
            {topFindings.map((f, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="truncate text-ink">{f.title}</span>
                <span
                  className="shrink-0 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: SEVERITY_COLOR[f.severity] }}
                >
                  {f.severity}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-line px-4 py-3">
            <Link href={`/projects/${params.id}/seo/audit`} className="text-sm font-medium text-brand hover:underline">
              View full audit →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
