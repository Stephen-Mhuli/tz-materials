export default function Loading() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[color:var(--page)]">
      <span className="spinner h-8 w-8 rounded-full border-4 border-[color:var(--loader-spinner)] border-t-transparent" />
    </main>
  );
}
