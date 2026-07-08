# Product Requirements Document

## Problem
Workflow consultants photograph flipchart process maps after workshops, then manually redraw them in Excel or Visio — a task that takes hours per map. There is no tool that goes directly from photo to editable workflow file.

## Target User
Consultants at a workflow consulting firm who run client mapping workshops.

## Core Objects
- **Process Map** — the parent record: client name, uploaded photo, status (draft / reviewed)
- **Process Step** — a single node extracted from the map: label, type (start / task / decision / end), sequence order, AI confidence
- **Export Log** — a record of every file downloaded (format, timestamp)

## MVP Must-Haves (v1)
- [ ] Upload a photo of a flipchart map
- [ ] AI automatically extracts steps and their types from the photo
- [ ] Extracted steps display in an editable table (label, type, order)
- [ ] Consultant can correct any step inline and save changes
- [ ] Export the confirmed map as **Excel (.xlsx)** or **DrawIO XML** (Visio-compatible)
- [ ] All screens work without a login (demo-first)

## Non-Goals (v1)
- User accounts and data isolation
- Team/shared workspaces
- Direct upload to SharePoint or Visio cloud
- Version history / map diffing
- Workshop report generation

## Success Criteria
A consultant photographs a 12-step flipchart process map, uploads it, reviews and corrects the AI-extracted steps in under 3 minutes, and downloads a working Excel file — without touching Visio or redrawing anything manually.
