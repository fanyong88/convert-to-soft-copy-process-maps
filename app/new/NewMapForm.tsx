"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createMap, type CreateMapState } from "@/lib/actions/maps";

const initialState: CreateMapState = { error: null };

export function NewMapForm() {
  const [state, formAction, pending] = useActionState(createMap, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      setFileName(null);
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
          Map Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. Purchase Order Flow"
          className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <div>
        <label htmlFor="client_name" className="block text-sm font-medium text-neutral-700">
          Client Name
        </label>
        <input
          id="client_name"
          name="client_name"
          type="text"
          placeholder="e.g. Test Co"
          className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <div>
        <label htmlFor="photo" className="block text-sm font-medium text-neutral-700">
          Flipchart Photo
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          required
          onChange={onPhotoChange}
          className="mt-1 block w-full text-sm text-neutral-600 file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-neutral-700"
        />
        <p className="mt-1 text-xs text-neutral-400">JPG, PNG, WEBP, or HEIC. Max 10 MB.</p>
        {preview && (
          <div className="mt-3 overflow-hidden rounded-lg border border-neutral-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={fileName ?? "preview"} className="max-h-64 w-full object-contain" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Uploading…" : "Create Map"}
        </button>
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-700">
          Cancel
        </Link>
      </div>
    </form>
  );
}
