"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AuditResult, StoredAuditRun } from "@/lib/audit-types";
import { storedRunToResult } from "@/lib/audit-types";
import type { Project } from "@/lib/projects";
import AuditReport from "@/components/AuditReport";
import AuditHistory from "@/components/AuditHistory";
import AuditProgress from "@/components/AuditProgress";

const POLL_MS = 1500;

export default function ProjectAuditPage({ params }: { params: { id: string } }) {
  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [history, setHistory] = useState<StoredAuditRun[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  const [domain, setDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);

  const [pollingRunId, setPollingRunId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshHistory = useCallback(() => {
    return fetch(`/api/audits?projectId=${projectId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
        return data as StoredAuditRun[];
      })
      .catch(() => [] as StoredAuditRun[]);
  }, [projectId]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    setPollingRunId(null);
  }, []);

  const startPolling = useCallback(
    (runId: string) => {
      stopPolling();
      setPollingRunId(runId);
      pollRef.current = setInterval(async () => {
        const res = await fetch(`/api/audit/${runId}`);
        if (!res.ok) return;
        const run: StoredAuditRun = await res.json();
        setCurrentStep(run.current_step);
        if (run.status === "complete") {
          setResult(storedRunToResult(run));
          setActiveRunId(run.id);
          stopPolling();
          refreshHistory();
        } else if (run.status === "error") {
          setError(run.current_step || "Audit failed");
          stopPolling();
          refreshHistory();
        }
      }, POLL_MS);
    },
    [stopPolling, refreshHistory]
  );

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.domain) {
          setProject(data);
          setDomain(data.domain);
        }
      })
      .catch(() => {});

    refreshHistory().then((rows) => {
      const running = rows.find((r) => r.status === "running");
      if (running) {
        setCurrentStep(running.current_step);
        startPolling(running.id);
      }
    });

    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function runAudit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim() || pollingRunId) return;
    setError(null);
    setResult(null);
    setActiveRunId(null);
    setCurrentStep("Starting…");
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start audit");
      refreshHistory();
      startPolling(data.runId);
    } catch (err) {
      setError((err as Error).message);
      setCurrentStep(null);
    }
  }

  function selectHistoryRun(run: StoredAuditRun) {
    if (run.status !== "complete") return;
    setResult(storedRunToResult(run));
    setActiveRunId(run.id);
  }

  const isRunning = pollingRunId !== null;

  return (
    <div>
      <p className="text-ink-secondary">
        Run a crawlable-data technical SEO audit (v1: no Search Console). The audit keeps running in the background even if
        you switch tabs or leave the page.
      </p>

      <form onSubmit={runAudit} className="mt-4 flex gap-2 rounded-2xl border border-line bg-surface p-2 shadow-sm">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Enter a domain, e.g. example.com"
          disabled={isRunning}
          className="flex-1 rounded-xl bg-transparent px-4 py-2.5 text-ink placeholder:text-ink-muted focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isRunning}
          className="rounded-xl bg-brand px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
        >
          {isRunning ? "Auditing…" : "Run audit"}
        </button>
      </form>
      {project && domain !== project.domain && !isRunning && (
        <p className="mt-2 text-xs text-ink-muted">Auditing a different URL than this project's domain ({project.domain}).</p>
      )}

      {isRunning && <AuditProgress step={currentStep} />}
      {error && <p className="mt-4 text-sm text-status-critical">{error}</p>}
      {result && !isRunning && <AuditReport result={result} />}

      <AuditHistory runs={history} onSelect={selectHistoryRun} activeId={activeRunId} />
    </div>
  );
}
