"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addStep, deleteStep, updateStep } from "@/lib/actions/steps";
import { ConfidenceBadge } from "@/app/components/ConfidenceBadge";
import type { ProcessStep, StepType } from "@/lib/types";

const STEP_TYPES: StepType[] = ["start", "task", "decision", "end"];
const EXTRACTION_TIMEOUT_MS = 25_000;
const POLL_INTERVAL_MS = 2_000;

export function StepsPanel({
  mapId,
  steps,
  mapCreatedAt,
}: {
  mapId: string;
  steps: ProcessStep[];
  mapCreatedAt: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ label: string; step_type: StepType; sequence: number }>({
    label: "",
    step_type: "task",
    sequence: 1,
  });
  const [adding, setAdding] = useState(false);
  const [newDraft, setNewDraft] = useState<{ label: string; step_type: StepType }>({
    label: "",
    step_type: "task",
  });

  const elapsed = Date.now() - new Date(mapCreatedAt).getTime();
  const [waitingForAi, setWaitingForAi] = useState(steps.length === 0 && elapsed < EXTRACTION_TIMEOUT_MS);
  const [retrying, setRetrying] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (steps.length > 0) {
      setWaitingForAi(false);
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    if (Date.now() - new Date(mapCreatedAt).getTime() >= EXTRACTION_TIMEOUT_MS) {
      setWaitingForAi(false);
      return;
    }

    setWaitingForAi(true);
    pollRef.current = setInterval(() => {
      if (Date.now() - new Date(mapCreatedAt).getTime() >= EXTRACTION_TIMEOUT_MS) {
        if (pollRef.current) clearInterval(pollRef.current);
        setWaitingForAi(false);
        return;
      }
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.length, mapCreatedAt]);

  function startEdit(step: ProcessStep) {
    setEditingId(step.id);
    setDraft({ label: step.label, step_type: step.step_type, sequence: step.sequence });
  }

  function saveEdit(stepId: string) {
    startTransition(async () => {
      await updateStep(mapId, stepId, draft);
      setEditingId(null);
      router.refresh();
    });
  }

  function onDelete(stepId: string) {
    if (!confirm("Delete this step?")) return;
    startTransition(async () => {
      await deleteStep(mapId, stepId);
      router.refresh();
    });
  }

  function onAdd() {
    if (!newDraft.label.trim()) return;
    startTransition(async () => {
      await addStep(mapId, {
        label: newDraft.label.trim(),
        step_type: newDraft.step_type,
        sequence: steps.length + 1,
      });
      setNewDraft({ label: "", step_type: "task" });
      setAdding(false);
      router.refresh();
    });
  }

  async function onRetryExtraction() {
    setRetrying(true);
    try {
      await fetch("/api/extract-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ map_id: mapId }),
      });
    } finally {
      setRetrying(false);
      router.refresh();
    }
  }

  if (steps.length === 0 && waitingForAi) {
    return (
      <div className="mt-2 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-300 p-10 text-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700" />
        <p className="text-sm text-neutral-500">Analysing your map…</p>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="mt-2 space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          AI couldn&apos;t extract steps from this photo (or extraction hasn&apos;t run yet).
          You can retry, or add steps manually below.
          <div className="mt-2">
            <button
              onClick={onRetryExtraction}
              disabled={retrying}
              className="inline-flex items-center rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
            >
              {retrying ? "Retrying…" : "Retry AI extraction"}
            </button>
          </div>
        </div>
        <AddStepForm
          adding={adding}
          setAdding={setAdding}
          newDraft={newDraft}
          setNewDraft={setNewDraft}
          onAdd={onAdd}
          isPending={isPending}
        />
      </div>
    );
  }

  const needsReview = steps
    .filter((s) => s.label_review_status === "unreviewed" && s.label_confidence !== null && s.label_confidence < 0.85)
    .sort((a, b) => (a.label_confidence ?? 0) - (b.label_confidence ?? 0));
  const needsReviewIds = new Set(needsReview.map((s) => s.id));
  const restInOrder = steps.filter((s) => !needsReviewIds.has(s.id));
  const orderedRows = [...needsReview, ...restInOrder];

  return (
    <div className="mt-2 space-y-3">
      {needsReview.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <span className="font-semibold">{needsReview.length}</span> step
          {needsReview.length === 1 ? "" : "s"} need review — flagged at the top of the table
          below.
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-neutral-500">#</th>
              <th className="px-3 py-2 text-left font-medium text-neutral-500">Label</th>
              <th className="px-3 py-2 text-left font-medium text-neutral-500">Type</th>
              <th className="px-3 py-2 text-left font-medium text-neutral-500">Confidence</th>
              <th className="px-3 py-2 text-right font-medium text-neutral-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {orderedRows.flatMap((step, i) => {
              const rows = [];
              if (i === needsReview.length && needsReview.length > 0 && restInOrder.length > 0) {
                rows.push(
                  <tr key="divider">
                    <td colSpan={5} className="bg-neutral-50 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                      Rest of process, in order
                    </td>
                  </tr>,
                );
              }
              const isFlagged = i < needsReview.length;
              rows.push(
              editingId === step.id ? (
                <tr key={step.id} className="bg-neutral-50">
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={draft.sequence}
                      onChange={(e) => setDraft({ ...draft, sequence: Number(e.target.value) })}
                      className="w-14 rounded border border-neutral-300 px-1.5 py-1 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={draft.label}
                      onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                      className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                      autoFocus
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={draft.step_type}
                      onChange={(e) => setDraft({ ...draft, step_type: e.target.value as StepType })}
                      className="rounded border border-neutral-300 px-1.5 py-1 text-sm capitalize"
                    >
                      {STEP_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-neutral-400">—</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => saveEdit(step.id)}
                      disabled={isPending}
                      className="mr-2 text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-60"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs font-medium text-neutral-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr
                  key={step.id}
                  className={`group ${isFlagged ? ((step.label_confidence ?? 1) < 0.7 ? "bg-red-50/60" : "bg-amber-50/60") : ""}`}
                >
                  <td className="px-3 py-2 text-neutral-500">{step.sequence}</td>
                  <td className="px-3 py-2 font-medium text-neutral-900">{step.label}</td>
                  <td className="px-3 py-2 capitalize text-neutral-600">{step.step_type}</td>
                  <td className="px-3 py-2">
                    <ConfidenceBadge
                      confidence={step.label_confidence}
                      reviewStatus={step.label_review_status}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => startEdit(step)}
                      className="mr-3 text-xs font-medium text-neutral-600 opacity-0 hover:underline group-hover:opacity-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(step.id)}
                      disabled={isPending}
                      className="text-xs font-medium text-red-600 opacity-0 hover:underline group-hover:opacity-100 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ),
              );
              return rows;
            })}
          </tbody>
        </table>
      </div>
      <AddStepForm
        adding={adding}
        setAdding={setAdding}
        newDraft={newDraft}
        setNewDraft={setNewDraft}
        onAdd={onAdd}
        isPending={isPending}
      />
    </div>
  );
}

function AddStepForm({
  adding,
  setAdding,
  newDraft,
  setNewDraft,
  onAdd,
  isPending,
}: {
  adding: boolean;
  setAdding: (v: boolean) => void;
  newDraft: { label: string; step_type: StepType };
  setNewDraft: (v: { label: string; step_type: StepType }) => void;
  onAdd: () => void;
  isPending: boolean;
}) {
  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
      >
        + Add step manually
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <input
        type="text"
        placeholder="Step label"
        value={newDraft.label}
        onChange={(e) => setNewDraft({ ...newDraft, label: e.target.value })}
        className="min-w-0 flex-1 rounded border border-neutral-300 px-2 py-1.5 text-sm"
        autoFocus
      />
      <select
        value={newDraft.step_type}
        onChange={(e) => setNewDraft({ ...newDraft, step_type: e.target.value as StepType })}
        className="rounded border border-neutral-300 px-1.5 py-1.5 text-sm capitalize"
      >
        {STEP_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <button
        onClick={onAdd}
        disabled={isPending || !newDraft.label.trim()}
        className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700 disabled:opacity-60"
      >
        Add
      </button>
      <button
        onClick={() => setAdding(false)}
        className="text-xs font-medium text-neutral-500 hover:underline"
      >
        Cancel
      </button>
    </div>
  );
}
