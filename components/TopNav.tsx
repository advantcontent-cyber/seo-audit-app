import Link from "next/link";

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export default function TopNav() {
  return (
    <header className="flex items-center gap-4 bg-sidebar px-5 py-3 text-white">
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold">S</span>
        <span className="text-sm font-semibold">SEO Dashboard</span>
      </Link>

      <div className="ml-2 hidden flex-1 sm:block">
        <div className="flex max-w-xs items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white/50">
          <SearchIcon />
          <span>Search…</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <button className="text-white/60 transition-colors hover:text-white" aria-label="Notifications" type="button">
          <BellIcon />
        </button>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/40 text-xs font-semibold text-white">
            AS
          </span>
          <span className="hidden text-sm font-medium sm:inline">Advant SEO</span>
        </div>
      </div>
    </header>
  );
}
