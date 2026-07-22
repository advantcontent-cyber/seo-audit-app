"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/projects";
import TopNav from "@/components/TopNav";
import AddProjectForm from "@/components/AddProjectForm";
import ProjectList from "@/components/ProjectList";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);

  function refreshProjects() {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setProjects(data))
      .catch(() => {});
  }

  useEffect(() => {
    refreshProjects();
  }, []);

  return (
    <div className="min-h-screen bg-surface-page">
      <TopNav />

      <main className="px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <div>
              <h1 className="text-xl font-semibold text-ink">Hi, welcome back!</h1>
              <p className="mt-1 text-sm text-ink-secondary">All your client projects, in one place.</p>
            </div>
          </div>

          <div className="mt-6">
            <AddProjectForm onCreated={refreshProjects} />
          </div>

          <ProjectList projects={projects} />
        </div>
      </main>
    </div>
  );
}
