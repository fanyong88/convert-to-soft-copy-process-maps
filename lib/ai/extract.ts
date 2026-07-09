import { createAdminClient } from "@/lib/supabase/admin";
import type { StepType } from "@/lib/types";

const VALID_TYPES: StepType[] = ["start", "task", "decision", "end"];

const SYSTEM_PROMPT = `You are an expert at reading hand-drawn flipchart process maps photographed after business workshops. The photo shows boxes, diamonds, arrows, and handwritten labels, possibly in multiple colours with varying legibility.

Read the map in its flow order (follow the arrows; if arrows are unclear, use reading order top-to-bottom, left-to-right) and return the steps as strict JSON with this exact shape:

{
  "steps": [
    { "sequence": 1, "label": "Receive Invoice", "step_type": "start", "confidence": 0.95 },
    { "sequence": 2, "label": "Amount > $10,000?", "step_type": "decision", "confidence": 0.72 }
  ]
}

Rules:
- step_type must be one of: "start", "task", "decision", "end".
- The first step is usually "start" and the last is usually "end"; everything else is "task" or "decision" (diamonds / yes-no questions are "decision").
- confidence is your own estimate (0 to 1) of how certain you are that the label is transcribed correctly given handwriting legibility.
- label should be a short, clean transcription of the handwritten text (fix obvious spelling only if the intent is unambiguous).
- If the photo has no readable process map, return { "steps": [] }.
- Return ONLY the JSON object, no commentary.`;

export interface ExtractResult {
  ok: boolean;
  count: number;
  error?: string;
}

export async function extractStepsForMap(mapId: string): Promise<ExtractResult> {
  const supabase = createAdminClient();

  const { data: map, error: mapError } = await supabase
    .from("process_maps")
    .select("photo_path, user_id")
    .eq("id", mapId)
    .single();

  if (mapError || !map?.photo_path) {
    return { ok: false, count: 0, error: "Map or photo not found" };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false, count: 0, error: "AI extraction is not configured (missing OPENAI_API_KEY)" };
  }

  // Bucket is private (docs/SECURITY.md lock-down sprint) — mint a short-lived
  // signed URL so OpenAI's servers can fetch the photo.
  const { data: signed, error: signError } = await supabase.storage
    .from("map-photos")
    .createSignedUrl(map.photo_path, 300);
  if (signError || !signed) {
    return { ok: false, count: 0, error: "Could not create a signed URL for the photo" };
  }

  let content: string;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        max_tokens: 2000,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract the process steps from this flipchart photo." },
              { type: "image_url", image_url: { url: signed.signedUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, count: 0, error: `OpenAI error ${res.status}: ${text.slice(0, 300)}` };
    }

    const json = await res.json();
    content = json.choices?.[0]?.message?.content;
    if (!content) return { ok: false, count: 0, error: "Empty AI response" };
  } catch (err) {
    return {
      ok: false,
      count: 0,
      error: err instanceof Error ? err.message : "AI request failed",
    };
  }

  let parsed: {
    steps?: Array<{ sequence?: number; label?: string; step_type?: string; confidence?: number }>;
  };
  try {
    parsed = JSON.parse(content);
  } catch {
    return { ok: false, count: 0, error: "Could not parse AI response as JSON" };
  }

  const steps = parsed.steps ?? [];
  if (steps.length === 0) {
    return { ok: false, count: 0, error: "AI could not find any steps in this photo" };
  }

  const rows = steps.map((s, i) => ({
    map_id: mapId,
    sequence: typeof s.sequence === "number" ? s.sequence : i + 1,
    label: (s.label ?? "Untitled step").toString().slice(0, 500),
    step_type: VALID_TYPES.includes(s.step_type as StepType) ? (s.step_type as StepType) : "task",
    label_source: "ai_vision",
    label_confidence:
      typeof s.confidence === "number" ? Math.max(0, Math.min(1, s.confidence)) : null,
    label_review_status: "unreviewed",
    user_id: map.user_id,
  }));

  const { error: insertError } = await supabase.from("process_steps").insert(rows);
  if (insertError) {
    return { ok: false, count: 0, error: insertError.message };
  }

  return { ok: true, count: rows.length };
}
