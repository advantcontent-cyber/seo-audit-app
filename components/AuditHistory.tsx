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
        {runs.map((run) => (
          <button
            key={run.id}
            onClick={() => onSelect(run)}
            className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-surface-page ${
              activeId === run.id ? "bg-surface-page" : ""
            }`}
          >
            <span className="truncate text-ink-secondary">{run.domain}</span>
            <span className="flex shrink-0 items-center gap-3">
              <span className="text-xs text-ink-muted">{new Date(run.created_at).toLocaleString()}</span>
              <span className="font-semibold" style={{ color: scoreColor(run.health_score) }}>
                {run.health_score}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
