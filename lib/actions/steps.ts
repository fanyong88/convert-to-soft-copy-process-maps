"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { StepType } from "@/lib/types";

export async function updateStep(
  mapId: string,
  stepId: string,
  updates: { label: string; step_type: StepType; sequence: number; notes?: string | null },
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("process_steps")
    .update({
      label: updates.label,
      step_type: updates.step_type,
      sequence: updates.sequence,
      notes: updates.notes ?? null,
      label_review_status: "overridden",
    })
    .eq("id", stepId);
  revalidatePath(`/map/${mapId}`);
}

export async function addStep(
  mapId: string,
  step: { label: string; step_type: StepType; sequence: number },
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("process_steps").insert({
    map_id: mapId,
    label: step.label,
    step_type: step.step_type,
    sequence: step.sequence,
    label_source: "manual",
    label_confidence: null,
    label_review_status: "reviewed",
    user_id: user.id,
  });
  revalidatePath(`/map/${mapId}`);
}

export async function deleteStep(mapId: string, stepId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("process_steps").delete().eq("id", stepId);
  revalidatePath(`/map/${mapId}`);
}
