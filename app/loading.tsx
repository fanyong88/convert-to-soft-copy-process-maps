export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="aspect-video w-full animate-pulse rounded-lg bg-neutral-200" />
            <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-neutral-200" />
            <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-neutral-200" />
          </div>
        ))}
      </div>
    </main>
  );
}
