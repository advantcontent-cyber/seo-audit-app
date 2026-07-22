import Link from "next/link";
import { notFound } from "next/navigation";
import TopNav from "@/components/TopNav";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import { supabaseServer } from "@/lib/supabase";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const { data: project } = await supabaseServer.from("projects").select("*").eq("id", params.id).maybeSingle();

  if (!project) notFound();

  return (
    <div className="min-h-screen bg-surface-page">
      <TopNav />

      <div className="border-b border-line bg-surface px-6 py-4 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="text-sm text-ink-muted hover:text-ink">
            ← All projects
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-ink">{project.name}</h1>
          <p className="text-sm text-ink-secondary">{project.domain}</p>
        </div>
      </div>

      <ProjectMenuBar projectId={params.id} />

      <main className="px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
