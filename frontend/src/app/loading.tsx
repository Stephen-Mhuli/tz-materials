export default function Loading() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <div className="flex items-center gap-3 rounded-full border border-muted bg-surface px-5 py-3 shadow-soft">
        <span className="spinner h-4 w-4 rounded-full border-2 border-muted border-t-transparent" />
        <span className="text-sm text-secondary">Loading the experience…</span>
      </div>
    </main>
  );
}
