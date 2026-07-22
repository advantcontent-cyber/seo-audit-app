"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { slug: "", label: "Overview" },
  { slug: "seo", label: "SEO" },
  { slug: "sem", label: "SEM" },
  { slug: "social", label: "Social Media" },
];

export default function ProjectMenuBar({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-line bg-surface px-6 sm:px-10">
      <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto">
        {ITEMS.map((item) => {
          const href = item.slug ? `/projects/${projectId}/${item.slug}` : `/projects/${projectId}`;
          const isActive = item.slug ? pathname?.startsWith(href) : pathname === `/projects/${projectId}`;
          return (
            <Link
              key={item.label}
              href={href}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                isActive ? "border-brand text-brand" : "border-transparent text-ink-secondary hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
