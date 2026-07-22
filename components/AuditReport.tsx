"use client";

import { useMemo, useState } from "react";
import type { AuditResult, Severity, Finding } from "@/lib/audit-types";
import SiteHealthGauge from "./SiteHealthGauge";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];

const SEVERITY_META: Record<Severity, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "#d03b3b", bg: "bg-status-critical/10" },
  high: { label: "High", color: "#ec835a", bg: "bg-status-serious/10" },
  medium: { label: "Medium", color: "#fab219", bg: "bg-status-warning/10" },
  low: { label: "Low", color: "#898781", bg: "bg-ink-muted/10" },
};

const CATEGORY_LABELS: Record<Finding["category"], string> = {
  crawl: "Crawl",
  "on-page": "On-page",
  technical: "Technical",
  performance: "Performance",
};

function StatTile({ severity, count }: { severity: Severity; count: number }) {
  const meta = SEVERITY_META[severity];
  return (
    <div className="flex-1 rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
        <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">{meta.label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-ink">{count}</div>
    </div>
  );
}

function CategoryTile({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex-1 rounded-2xl border border-line bg-surface px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="mt-1 text-lg font-semibold text-ink">{count}</div>
    </div>
  );
}

export default function AuditReport({ result }: { result: AuditResult }) {
  const [filter, setFilter] = useState<Severity | "all">("all");

  const categoryCounts = useMemo(() => {
    const counts: Record<Finding["category"], number> = { crawl: 0, "on-page": 0, technical: 0, performance: 0 };
    for (const f of result.findings) counts[f.category]++;
    return counts;
  }, [result.findings]);

  const filteredFindings = filter === "all" ? result.findings : result.findings.filter((f) => f.severity === filter);

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row">
        <SiteHealthGauge score={result.healthScore} />
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          {SEVERITY_ORDER.map((sev) => (
            <StatTile key={sev} severity={sev} count={result.summary[sev]} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(Object.keys(CATEGORY_LABELS) as Finding["category"][]).map((cat) => (
          <CategoryTile key={cat} label={CATEGORY_LABELS[cat]} count={categoryCounts[cat]} />
        ))}
      </div>

      <p className="text-sm text-ink-muted">
        Checked {result.pagesChecked} page{result.pagesChecked === 1 ? "" : "s"} on {result.domain}
      </p>

      <div className="rounded-2xl border border-line bg-surface">
        <div className="flex flex-wrap gap-1 border-b border-line p-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === "all" ? "bg-brand text-white" : "text-ink-secondary hover:bg-surface-page"
            }`}
          >
            All ({result.findings.length})
          </button>
          {SEVERITY_ORDER.map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === sev ? "text-white" : "text-ink-secondary hover:bg-surface-page"
              }`}
              style={filter === sev ? { backgroundColor: SEVERITY_META[sev].color } : undefined}
            >
              {SEVERITY_META[sev].label} ({result.summary[sev]})
            </button>
          ))}
        </div>

        <div className="divide-y divide-line">
          {filteredFindings.length === 0 && (
            <p className="p-6 text-center text-sm text-ink-muted">No findings in this category.</p>
          )}
          {filteredFindings.map((f, i) => {
            const meta = SEVERITY_META[f.severity];
            return (
              <div key={i} className="flex gap-3 p-4" style={{ borderLeft: `3px solid ${meta.color}` }}>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-ink">{f.title}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: meta.color, backgroundColor: `${meta.color}1a` }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-secondary">{f.detail}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                    <span className="rounded bg-surface-page px-1.5 py-0.5">{CATEGORY_LABELS[f.category]}</span>
                    {f.url && <span className="truncate">{f.url}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
