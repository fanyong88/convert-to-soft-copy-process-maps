# Architecture

## Stack
- **Frontend:** Next.js (App Router) on Vercel
- **Database + Storage:** Supabase (Postgres + Storage bucket `map-photos`)
- **AI:** OpenAI GPT-4o Vision API (server-side API route only)
- **Export:** `xlsx` npm package for Excel; hand-built DrawIO XML string for Visio-compatible output

## What to Build Now vs Later
**Now:** upload → AI extract → edit steps → export file 
**Later:** auth, per-user isolation, folder organisation, SharePoint push

## Key User Action — Step by Step
1. Consultant opens the app (no login required)
2. Clicks **New Map**, enters a name and client, uploads a photo
3. Photo saves to Supabase Storage; `process_maps` row created with `photo_url`
4. Server-side API route sends photo URL to GPT-4o Vision with a structured extraction prompt
5. AI response is parsed into `process_steps` rows (label, type, sequence, confidence, source)
6. Consultant sees the extracted steps table — edits inline, reorders, deletes bad rows
7. Clicks **Export → Excel** or **Export → DrawIO XML**; server builds file and streams download
8. Export event written to `export_logs`

## Layer Plan
1. **Data first** — tables and RLS in place before any UI
2. **App logic** — upload, CRUD on steps, export generation (works without AI if API is down)
3. **Smart features** — AI extraction sits on top; if it fails, consultant enters steps manually

## Core Without AI
If the OpenAI call fails, the map is created with zero steps and the consultant fills them in manually. Export still works. The AI is an accelerator, not a hard dependency.
