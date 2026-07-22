"use client";

import { useState } from "react";
import type { AuditResult } from "@/lib/audit";
import AuditReport from "@/components/AuditReport";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);

  async function runAudit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Audit failed");
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-semibold text-ink">Site Audit</h1>
          <p className="mt-1 text-ink-secondary">Run a crawlable-data technical SEO audit (v1: no Search Console).</p>

          <form onSubmit={runAudit} className="mt-6 flex gap-2 rounded-2xl border border-line bg-surface p-2 shadow-sm">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter a domain, e.g. example.com"
              className="flex-1 rounded-xl bg-transparent px-4 py-2.5 text-ink placeholder:text-ink-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-brand px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
            >
              {loading ? "Auditing…" : "Run audit"}
            </button>
          </form>

          {error && <p className="mt-4 text-sm text-status-critical">{error}</p>}
          {result && <AuditReport result={result} />}
        </div>
      </main>
    </div>
  );
}
