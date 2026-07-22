export type Severity = "critical" | "high" | "medium" | "low";

export interface Finding {
  category: "crawl" | "on-page" | "technical" | "performance";
  severity: Severity;
  title: string;
  detail: string;
  url?: string;
}

export interface AuditResult {
  domain: string;
  startedAt: string;
  pagesChecked: number;
  findings: Finding[];
  summary: Record<Severity, number>;
  healthScore: number;
}

export interface StoredAuditRun {
  id: string;
  project_id: string | null;
  domain: string;
  pages_checked: number;
  health_score: number;
  summary: Record<Severity, number>;
  findings: Finding[];
  started_at: string;
  created_at: string;
}

export function storedRunToResult(row: StoredAuditRun): AuditResult {
  return {
    domain: row.domain,
    startedAt: row.started_at,
    pagesChecked: row.pages_checked,
    findings: row.findings,
    summary: row.summary,
    healthScore: row.health_score,
  };
}
