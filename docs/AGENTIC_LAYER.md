# Agentic Layer

## Risk Classification

### Low Risk — Auto-execute (no approval needed)
- **Extract steps from photo** — calls GPT-4o Vision, writes `process_steps` rows, sets `review_status = unreviewed`
- **Flag low-confidence steps** — reads confidence scores, highlights in UI

### Medium Risk — Show draft, consultant confirms before saving
- **Reorder steps** — AI suggests a reordered sequence if flow arrows are detected; consultant accepts or dismisses

### High Risk — Always requires explicit approval
- **Export and download file** — consultant clicks Export button; no auto-download without intent

### Human-Only (never automated)
- **Delete a process map** — requires explicit confirmation modal; no agent-triggered deletion
- **Override a reviewed step back to unreviewed** — manual only

## Named Tools (approved list)
- `extract_steps_from_image(map_id, photo_url)` — calls Vision API, persists steps
- `generate_excel_export(map_id)` — builds and streams .xlsx
- `generate_drawio_export(map_id)` — builds and streams DrawIO XML
- `log_export(map_id, format)` — writes to export_logs

## Audit Log Fields (export_logs)
- `map_id`, `export_format`, `triggered_by`, `created_at`

## v1 vs Later
- **v1:** Only `extract_steps_from_image` runs automatically (low risk); all exports are user-triggered
- **Later:** Agent suggests missing steps based on step-type patterns (e.g. no `end` node detected)
