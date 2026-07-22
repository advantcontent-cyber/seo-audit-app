"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/projects";

export default function AddProjectForm({ onCreated }: { onCreated?: (project: Project) => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !domain.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add project");
      onCreated?.(data);
      router.push(`/projects/${data.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 rounded-2xl border border-line bg-surface p-2 shadow-sm">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Client name"
        className="min-w-[10rem] flex-1 rounded-xl bg-transparent px-4 py-2.5 text-ink placeholder:text-ink-muted focus:outline-none"
      />
      <input
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="Domain, e.g. example.com"
        className="min-w-[10rem] flex-1 rounded-xl bg-transparent px-4 py-2.5 text-ink placeholder:text-ink-muted focus:outline-none"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-brand px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
      >
        {saving ? "Adding…" : "Add project"}
      </button>
      {error && <p className="w-full text-sm text-status-critical">{error}</p>}
    </form>
  );
}
