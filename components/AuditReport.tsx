"use client";

import type { AuditResult, Severity } from "@/lib/audit";

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-slate-100 text-slate-700 border-slate-300",
};

export default function AuditReport({ result }: { result: AuditResult }) {
  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap gap-3">
        {(["critical", "high", "medium", "low"] as Severity[]).map((sev) => (
          <div key={sev} className={`rounded-lg border px-4 py-2 ${SEVERITY_STYLES[sev]}`}>
            <div className="text-xs uppercase tracking-wide font-medium">{sev}</div>
            <div className="text-2xl font-semibold">{result.summary[sev]}</div>
          </div>
        ))}
      </div>

      <p className="text-sm text-slate-500">
        Checked {result.pagesChecked} page{result.pagesChecked === 1 ? "" : "s"} on {result.domain}
      </p>

      <div className="space-y-3">
        {result.findings.map((f, i) => (
          <div key={i} className={`rounded-lg border p-4 ${SEVERITY_STYLES[f.severity]}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{f.title}</span>
              <span className="text-xs uppercase font-semibold">{f.severity}</span>
            </div>
            <p className="text-sm mt-1">{f.detail}</p>
            {f.url && <p className="text-xs mt-1 opacity-70 break-all">{f.url}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
