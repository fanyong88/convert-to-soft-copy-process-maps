# Tasks & Sprints

## Sprint 1 — Database, Storage, and Upload
**Goal:** Schema live, demo data visible, photo upload working.

- [ ] Run migration SQL (process_maps, process_steps, export_logs + seed data)
- [ ] Create Supabase Storage bucket `map-photos`
- [ ] Build homepage: list of process maps (name, client, status, step count)
- [ ] Build **New Map** form: name, client_name, photo upload
- [ ] Save photo to Storage, write process_maps row with photo_url
- [ ] All pages render for anonymous visitors with seed data visible
- [ ] Handle loading, empty (no maps yet), and error states on map list

**Definition of Done:** Seed maps appear on homepage with no login. A new map with a photo can be created and appears in the list. DB row and Storage object both exist after upload.

---

## Sprint 2 — AI Extraction Engine ✅ *v1 functional milestone*
**Goal:** Upload a photo and get extracted, editable steps — end to end.

- [ ] Build `/api/extract-steps` server route: receive map_id, fetch photo, call GPT-4o Vision, parse JSON
- [ ] On upload completion, trigger extraction automatically
- [ ] Write parsed steps to process_steps (label, step_type, sequence, label_source='ai_vision', label_confidence, label_review_status='unreviewed')
- [ ] Map detail page: photo thumbnail + editable steps table
- [ ] Inline edit: label, step_type, sequence
- [ ] Save edits to DB; set label_review_status='reviewed' or 'overridden'
- [ ] Amber flag for confidence 0.70–0.84; red flag for < 0.70
- [ ] Handle AI failure gracefully: show empty steps table with manual entry option
- [ ] Mark map status 'reviewed' when consultant clicks **Mark as Reviewed**

**Definition of Done:** Upload a real flipchart photo → steps appear within 15 seconds → edit a step → save persists on refresh → map status can be set to reviewed.

---

## Sprint 3 — Export Engine
**Goal:** Download working Excel and DrawIO XML files.

- [ ] `/api/export/excel`: query process_steps ordered by sequence, build .xlsx with columns (Sequence, Label, Type, Notes), stream to browser
- [ ] `/api/export/drawio`: generate DrawIO XML with one shape per step_type, connect in sequence order, stream to browser
- [ ] Export buttons on map detail page
- [ ] Write export_logs row on every download
- [ ] Confirm Excel opens in Excel/Google Sheets with correct rows
- [ ] Confirm DrawIO XML opens in draw.io and Visio
- [ ] Handle empty steps edge case (disable export buttons with tooltip)

**Definition of Done:** A reviewed map's Export Excel button downloads a .xlsx that opens correctly. Export DrawIO button downloads XML that renders the process flow in draw.io.

---

## Sprint 4 — Review UX and Polish
**Goal:** App is clean, robust, and consultant-ready.

- [ ] Side-by-side layout: photo on left, steps table on right (desktop)
- [ ] Low-confidence steps grouped at top of table with visual callout
- [ ] Add step manually (inline row append)
- [ ] Delete step (with confirmation)
- [ ] Delete map (with confirmation modal) — writes to audit log
- [ ] Loading skeleton on extraction; progress message ("Analysing your map...")
- [ ] Error banner if extraction fails with retry button
- [ ] Map list: show step count, confidence summary, export history count
- [ ] All five states (loading, empty, partial, error, ready) present on every screen

**Definition of Done:** Every button and form persists to DB. No dead buttons. Error states display and recover. UI tested against all five screen states.

---

## Sprint 5 — Lock It Down
**Goal:** Per-consultant data isolation before real client data goes in.

- [ ] Enable Supabase Auth (email/password)
- [ ] Login and signup pages
- [ ] Populate user_id on process_maps and process_steps at write time
- [ ] Replace v1 RLS policies with `auth.uid() = user_id` owner-scoped policies
- [ ] Make Storage bucket private; serve photos via signed URLs
- [ ] Redirect unauthenticated users to login
- [ ] Test: consultant A cannot see consultant B's maps
- [ ] Test: signed URLs expire and cannot be shared publicly

**Definition of Done:** Two test accounts exist. Each sees only their own maps. No cross-consultant data leaks confirmed by direct Supabase query check.

---

## Gantt (Sprint → Deliverable)
```
Sprint 1  |-- DB + upload live, demo data visible
Sprint 2  |-- AI extract + edit steps (v1 functional ✅)
Sprint 3  |-- Excel + DrawIO export downloads work
Sprint 4  |-- Full UX polish, all states handled
Sprint 5  |-- Auth + per-user isolation (lock-down)
```
