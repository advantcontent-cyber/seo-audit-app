"use client";

import type { Project } from "@/lib/projects";

function scoreColor(score: number | null): string {
  if (score === null) return "#898781";
  if (score >= 80) return "#0ca30c";
  if (score >= 50) return "#fab219";
  return "#d03b3b";
}

export default function ProjectList({
  projects,
  activeId,
  onSelect,
}: {
  projects: Project[];
  activeId: string | null;
  onSelect: (project: Project) => void;
}) {
  if (projects.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">Your Projects</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className={`rounded-2xl border bg-surface p-4 text-left transition-colors hover:border-brand ${
              activeId === p.id ? "border-brand" : "border-line"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium text-ink">{p.domain}</span>
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: scoreColor(p.latest_health_score) }}
              >
                {p.latest_health_score ?? "–"}
              </span>
            </div>
            <div className="mt-1 text-xs text-ink-muted">
              {p.last_audited_at ? `Last audited ${new Date(p.last_audited_at).toLocaleDateString()}` : "Not yet audited"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
