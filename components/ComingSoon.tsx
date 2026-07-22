export default function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-secondary">{description}</p>
      <span className="mt-4 inline-block rounded-full bg-surface-page px-3 py-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
        Coming soon
      </span>
    </div>
  );
}
