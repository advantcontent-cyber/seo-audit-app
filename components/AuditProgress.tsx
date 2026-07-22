function parsePercent(step: string | null): number {
  if (!step) return 8;
  const m = step.match(/page (\d+) of (\d+)/i);
  if (m) return 10 + Math.round((parseInt(m[1], 10) / parseInt(m[2], 10)) * 60); // crawl = bulk of the work
  if (/robots|sitemap/i.test(step)) return 5;
  if (/duplicate/i.test(step)) return 78;
  if (/core web vitals/i.test(step)) return 88;
  return 15;
}

export default function AuditProgress({ step }: { step: string | null }) {
  const percent = parsePercent(step);

  return (
    <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center gap-2.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
        <span className="text-sm text-ink">{step ?? "Running audit…"}</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-page">
        <div className="h-full rounded-full bg-brand transition-all duration-700 ease-out" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
