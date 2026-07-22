"use client";

import { useEffect, useState } from "react";
import type { AuditResult, StoredAuditRun } from "@/lib/audit-types";
import { storedRunToResult } from "@/lib/audit-types";
import type { Project } from "@/lib/projects";
import AuditReport from "@/components/AuditReport";
import Sidebar from "@/components/Sidebar";
import ProjectList from "@/components/ProjectList";
import AuditHistory from "@/components/AuditHistory";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [history, setHistory] = useState<StoredAuditRun[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);

  function refreshProjects() {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setProjects(data))
      .catch(() => {});
  }

  useEffect(() => {
    refreshProjects();
  }, []);

  function refreshHistory(projectId: string) {
    fetch(`/api/audits?projectId=${projectId}`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setHistory(data))
      .catch(() => {});
  }

  function selectProject(project: Project) {
    setActiveProjectId(project.id);
    setDomain(project.domain);
    setResult(null);
    setActiveRunId(null);
    refreshHistory(project.id);
  }

  async function runAudit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveRunId(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Audit failed");
      setResult(data);
      setActiveProjectId(data.projectId ?? null);
      refreshProjects();
      if (data.projectId) refreshHistory(data.projectId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function selectHistoryRun(run: StoredAuditRun) {
    setResult(storedRunToResult(run));
    setActiveRunId(run.id);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-semibold text-ink">Site Audit</h1>
          <p className="mt-1 text-ink-secondary">
            Enter a domain and run an audit — a project is created automatically the first time you audit it.
          </p>

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
          {result && activeProjectId && <AuditHistory runs={history} onSelect={selectHistoryRun} activeId={activeRunId} />}

          <ProjectList projects={projects} activeId={activeProjectId} onSelect={selectProject} />
        </div>
      </main>
    </div>
  );
}
