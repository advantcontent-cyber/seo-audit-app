"use client";

import type { StoredAuditRun } from "@/lib/audit-types";

function scoreColor(score: number): string {
  if (score >= 80) return "#0ca30c";
  if (score >= 50) return "#fab219";
  return "#d03b3b";
}

export default function AuditHistory({
  runs,
  onSelect,
  activeId,
}: {
  runs: StoredAuditRun[];
  onSelect: (run: StoredAuditRun) => void;
  activeId?: string | null;
}) {
  if (runs.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl border border-line bg-surface">
      <div className="border-b border-line px-4 py-3 text-sm font-medium text-ink">History</div>
      <div className="divide-y divide-line">
        {runs.map((run) => {
          const disabled = run.status !== "complete";
          return (
            <button
              key={run.id}
              onClick={() => !disabled && onSelect(run)}
              disabled={disabled}
              className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors ${
                disabled ? "cursor-default" : "hover:bg-surface-page"
              } ${activeId === run.id ? "bg-surface-page" : ""}`}
            >
              <span className="truncate text-ink-secondary">{run.domain}</span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-ink-muted">{new Date(run.created_at).toLocaleString()}</span>
                {run.status === "running" && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-brand">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                    Running
                  </span>
                )}
                {run.status === "error" && <span className="text-xs font-medium text-status-critical">Failed</span>}
                {run.status === "complete" && (
                  <span className="font-semibold" style={{ color: scoreColor(run.health_score ?? 0) }}>
                    {run.health_score}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
