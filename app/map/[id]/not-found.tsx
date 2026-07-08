import Link from "next/link";

export default function MapNotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-xl font-semibold text-neutral-900">Map not found</h1>
      <p className="mt-2 text-sm text-neutral-500">
        This process map doesn&apos;t exist or may have been deleted.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
      >
        Back to all maps
      </Link>
    </main>
  );
}
