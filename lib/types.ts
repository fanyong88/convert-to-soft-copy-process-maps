export type MapStatus = "draft" | "reviewed";
export type StepType = "start" | "task" | "decision" | "end";
export type LabelSource = "ai_vision" | "manual";
export type ReviewStatus = "unreviewed" | "reviewed" | "overridden";
export type ExportFormat = "excel" | "drawio_xml";

export interface ProcessMap {
  id: string;
  user_id: string | null;
  created_at: string;
  name: string;
  client_name: string | null;
  photo_url: string | null;
  photo_path: string | null;
  status: MapStatus;
  notes: string | null;
}

export interface ProcessStep {
  id: string;
  user_id: string | null;
  created_at: string;
  map_id: string;
  sequence: number;
  label: string;
  step_type: StepType;
  notes: string | null;
  label_source: LabelSource | null;
  label_confidence: number | null;
  label_review_status: ReviewStatus | null;
}

export interface ExportLog {
  id: string;
  user_id: string | null;
  created_at: string;
  map_id: string;
  export_format: ExportFormat;
  triggered_by: string | null;
}
