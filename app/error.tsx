"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-xl font-semibold text-neutral-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-neutral-500">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
      >
        Try again
      </button>
    </main>
  );
}
