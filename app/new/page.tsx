import { NewMapForm } from "@/app/new/NewMapForm";

export default function NewMapPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">New Map</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Upload a photo of your flipchart process map. We&apos;ll extract the steps automatically.
      </p>
      <div className="mt-8">
        <NewMapForm />
      </div>
    </main>
  );
}
