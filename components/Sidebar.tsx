const TOOLS = [
  { label: "Site Audit", active: true },
  { label: "Keyword Tracking", active: false },
  { label: "GEO Checklist", active: false },
  { label: "Reporting", active: false },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-sidebar text-white/80">
      <div className="flex items-center gap-2 px-5 py-6">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-sm font-bold text-white">A</span>
        <span className="text-sm font-semibold text-white">Advant SEO</span>
      </div>

      <nav className="flex-1 px-3">
        <div className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-white/35">Tools</div>
        <ul className="space-y-0.5">
          {TOOLS.map((tool) => (
            <li key={tool.label}>
              {tool.active ? (
                <span className="flex items-center gap-2.5 rounded-lg bg-sidebar-hover px-3 py-2 text-sm font-medium text-white">
                  {tool.label}
                </span>
              ) : (
                <span className="flex items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-sm text-white/40">
                  {tool.label}
                  <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-white/40">
                    Soon
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-sidebar-line px-5 py-4 text-xs text-white/35">SEO Workflow App — v1</div>
    </aside>
  );
}
