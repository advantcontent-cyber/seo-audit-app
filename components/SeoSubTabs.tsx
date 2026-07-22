"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { slug: "audit", label: "SEO Audit", active: true },
  { slug: "keywords", label: "Keyword Tracking", active: false },
  { slug: "geo", label: "GEO Checklist", active: false },
  { slug: "reporting", label: "Reporting", active: false },
];

export default function SeoSubTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-1 border-b border-line">
      {TABS.map((tab) => {
        const href = `/projects/${projectId}/seo/${tab.slug}`;
        const isActive = pathname?.startsWith(href);
        return (
          <Link
            key={tab.slug}
            href={href}
            className={`relative px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? "text-brand" : "text-ink-secondary hover:text-ink"
            }`}
          >
            {tab.label}
            {!tab.active && (
              <span className="ml-1.5 rounded-full bg-surface-page px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-muted">
                Soon
              </span>
            )}
            {isActive && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand" />}
          </Link>
        );
      })}
    </div>
  );
}
